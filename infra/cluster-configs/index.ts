import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as github from '@pulumi/github';
import * as authorization from '@pulumi/azure-native/authorization';
import {execSync} from 'child_process';
import {config} from './config';

const env = pulumi.getStack();
const tenantId = authorization.getClientConfig().then((config) => config.tenantId);

const provider = new k8s.Provider('k8s', {
    kubeconfig: config.kubeConfig,
});

const gotkComponentsRaw = execSync(
    `flux install --version=${config.fluxVersion} --namespace=flux-system --components-extra="image-reflector-controller,image-automation-controller" --export`,
).toString();

const gotkSyncRaw = `
apiVersion: source.toolkit.fluxcd.io/v1beta1
kind: GitRepository
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 1m0s
  ref:
    branch: ${config.branch}
  secretRef:
    name: flux-system
  url: ssh://git@github.com/e-dang/App.git
  ignore: |
    /*
    !/flux
    !/charts
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./flux/clusters/dev
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
  validation: client
---
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: flux-system
  namespace: flux-system
spec:
  git:
    checkout:
      ref:
        branch: ${config.branch}
    commit:
      author:
        email: fluxcdbot@dne.com
        name: fluxcdbot
      messageTemplate: '{{range .Updated.Images}}{{println .}}{{end}}'
    push:
      branch: ${config.branch}
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  update:
    path: flux/apps/dev
    strategy: Setters
`;

const gotkPatchesRaw = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kustomize-controller
  namespace: flux-system
spec:
  template:
    spec:
      containers:
      - name: manager
        envFrom:
        - secretRef:
            name: sops-akv-decryptor-service-principal
`;

const gotkKustomizationRaw = `
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - gotk-components.yaml
  - gotk-sync.yaml
patchesStrategicMerge:
  - gotk-patches.yaml
`;

const fluxSystemNamespace = new k8s.core.v1.Namespace(
    'flux-system',
    {
        metadata: {
            name: 'flux-system',
            labels: {
                'app.kubernetes.io/instance': 'flux-system',
                'app.kubernetes.io/part-of': 'flux',
                'app.kubernetes.io/version': config.fluxVersion,
            },
        },
    },
    {provider},
);

const gotkComponentsManifests = new k8s.yaml.ConfigGroup(
    'gotk-components',
    {
        yaml: gotkComponentsRaw
            .split('---')
            .filter((val) => !val.includes('kind: Namespace')) // remove flux-system namespace and apply it manually
            .join('---'),
    },
    {provider, dependsOn: [fluxSystemNamespace]},
);

const gotkSyncManifests = new k8s.yaml.ConfigGroup(
    'gotk-sync',
    {
        yaml: gotkSyncRaw,
    },
    {provider, dependsOn: [gotkComponentsManifests]},
);

const sopsDecryptionSecret = new k8s.core.v1.Secret(
    'sops-decryption-secret',
    {
        metadata: {
            name: 'sops-akv-decryptor-service-principal',
            namespace: 'flux-system',
        },
        stringData: {
            AZURE_TENANT_ID: tenantId,
            AZURE_CLIENT_ID: config.akvClientId,
            AZURE_CLIENT_SECRET: config.akvClientSecret,
        },
    },
    {dependsOn: [fluxSystemNamespace]},
);

const githubSshSecret = new k8s.core.v1.Secret(
    'github-ssh',
    {
        metadata: {
            name: 'flux-system',
            namespace: 'flux-system',
        },
        stringData: {
            identity: config.githubIdentity,
            'identity.pub': config.githubIdentityPub,
            known_hosts: config.githubKnownHosts,
        },
    },
    {dependsOn: [gotkComponentsManifests]},
);

const githubProvider = new github.Provider('github-provider', {
    owner: config.githubOwner,
    token: config.githubToken,
});

const gotkComponentsFile = new github.RepositoryFile(
    'gotk-components',
    {
        repository: 'App',
        branch: config.branch,
        file: `flux/clusters/${env}/flux-system/gotk-components.yaml`,
        content: gotkComponentsRaw,
        overwriteOnCreate: true,
    },
    {provider: githubProvider},
);

const gotkSyncFile = new github.RepositoryFile(
    'gotk-sync',
    {
        repository: 'App',
        branch: config.branch,
        file: `flux/clusters/${env}/flux-system/gotk-sync.yaml`,
        content: gotkSyncRaw,
        overwriteOnCreate: true,
    },
    {provider: githubProvider},
);

const gotkPatchesFile = new github.RepositoryFile(
    'gotk-patches',
    {
        repository: 'App',
        branch: config.branch,
        file: `flux/clusters/${env}/flux-system/gotk-patches.yaml`,
        content: gotkPatchesRaw,
        overwriteOnCreate: true,
    },
    {provider: githubProvider},
);

const gotkKustomizationFile = new github.RepositoryFile(
    'gotk-kustomization',
    {
        repository: 'App',
        branch: config.branch,
        file: `flux/clusters/${env}/flux-system/kustomization.yaml`,
        content: gotkKustomizationRaw,
        overwriteOnCreate: true,
    },
    {provider: githubProvider},
);

const devRole = new k8s.rbac.v1.ClusterRole(
    'dev-role',
    {
        metadata: {
            name: 'dev-user-read-access',
        },
        rules: [{apiGroups: [''], resources: ['*'], verbs: ['get', 'watch', 'list']}],
    },
    {provider},
);

const devRoleBinding = new k8s.rbac.v1.ClusterRoleBinding(
    'dev-role-binding',
    {
        metadata: {
            name: 'dev-role-binding',
        },
        roleRef: {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'ClusterRole',
            name: devRole.metadata.name,
        },
        subjects: [{kind: 'Group', name: config.devGroupId}],
    },
    {provider},
);
