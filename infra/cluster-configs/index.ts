import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as github from '@pulumi/github';
import {execSync} from 'child_process';
import {config} from './config';

const provider = new k8s.Provider('k8s', {
    kubeconfig: config.kubeConfig,
});

const gotkComponentsRaw = execSync(
    'flux install --version=0.18.3 --namespace=flux-system --components-extra="image-reflector-controller,image-automation-controller" --export',
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

const gotkComponentsManifests = new k8s.yaml.ConfigGroup(
    'gotk-components',
    {
        yaml: gotkComponentsRaw,
    },
    {provider},
);

const gotkSyncManifests = new k8s.yaml.ConfigGroup(
    'gotk-sync',
    {
        yaml: gotkSyncRaw,
    },
    {provider, dependsOn: [gotkComponentsManifests]},
);

const sopsSecret = new k8s.core.v1.Secret(
    'sops-key',
    {
        metadata: {
            name: 'sops-gpg',
            namespace: 'flux-system',
        },
        stringData: {
            'sops.asc': config.sopsSecret,
        },
    },
    {dependsOn: [gotkComponentsManifests]},
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

const gotkComponentsFile = new github.RepositoryFile('gotk-components', {
    repository: 'App',
    branch: config.branch,
    file: 'flux/clusters/dev/flux-system/gotk-components.yaml',
    content: gotkComponentsRaw,
    overwriteOnCreate: true,
});

const gotkSyncFile = new github.RepositoryFile('gotk-sync', {
    repository: 'App',
    branch: config.branch,
    file: 'flux/clusters/dev/flux-system/gotk-sync.yaml',
    content: gotkSyncRaw,
    overwriteOnCreate: true,
});

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
