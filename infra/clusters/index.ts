import * as pulumi from '@pulumi/pulumi';
import * as authorization from '@pulumi/azure-native/authorization';
import * as containerservice from '@pulumi/azure-native/containerservice';
import {execSync} from 'child_process';
import {config} from './config';

const env = pulumi.getStack();

const cluster = new containerservice.ManagedCluster('aks', {
    aadProfile: {
        adminGroupObjectIDs: [config.adminGroupId],
        enableAzureRBAC: true,
        managed: true,
    },
    addonProfiles: {},
    agentPoolProfiles: [
        {
            count: 1,
            enableNodePublicIP: false,
            mode: 'System',
            name: 'default',
            osType: 'Linux',
            type: 'VirtualMachineScaleSets',
            vmSize: 'Standard_A2_v2',
            vnetSubnetID: config.subnetId,
        },
    ],
    autoScalerProfile: {
        scaleDownDelayAfterAdd: '15m',
        scanInterval: '20s',
    },
    dnsPrefix: `tracker-${env}`,
    enableRBAC: true,
    kubernetesVersion: '1.20.9',
    identity: {
        type: 'SystemAssigned',
    },
    resourceGroupName: config.resourceGroupName,
    resourceName: env,
    tags: {
        environment: env,
    },
});

const clusterKeyVaultAccess = new authorization.RoleAssignment('cluster-keyvault', {
    principalId: cluster.identity.apply((id) => id?.principalId || ''),
    principalType: 'ServicePrincipal',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/12338af0-0e69-4776-bea7-57ae8d297424', // Key Vault Crypto User
    scope: config.vaultId,
});

const devAccess = new authorization.RoleAssignment('dev-access', {
    principalId: config.devGroupId,
    principalType: 'Group',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/4abbcc35-e782-43d8-92c5-2d3f1bd2253f', // Azure Kubernetes Service Cluster User Role
    scope: cluster.id,
});

const creds = pulumi.secret(
    pulumi.all([cluster.name, config.resourceGroupName]).apply(([clusterName, rgName]) => {
        return containerservice.listManagedClusterAdminCredentials({
            resourceGroupName: rgName,
            resourceName: clusterName,
        });
    }),
);

export const clusterId = cluster.id;
export const kubeConfig = creds.kubeconfigs[0].value.apply((enc) => Buffer.from(enc, 'base64').toString());

// This section is running the cluster only on spot nodes in order to decrease the price for development
if (env == 'dev') {
    // Add spot node pool
    const spotNodes = new containerservice.AgentPool('spot-nodes', {
        agentPoolName: 'spotnodepool',
        resourceGroupName: config.resourceGroupName,
        resourceName: cluster.name,
        scaleSetPriority: 'Spot',
        vmSize: 'Standard_A2_v2',
        vnetSubnetID: config.subnetId,
        enableAutoScaling: true,
        count: 1,
        minCount: 1,
        maxCount: 3,
        scaleSetEvictionPolicy: 'Delete',
        spotMaxPrice: -1,
        osDiskSizeGB: 32,
    });

    // Delete default node pool and remove spot node taints
    pulumi.all([kubeConfig, spotNodes.id]).apply(([kubeConfig, _]) => {
        const nodes = execSync(`kubectl get nodes -o=name --kubeconfig <(echo "${kubeConfig}")`, {
            shell: '/bin/bash',
        }).toString();

        nodes
            .split('\n')
            .filter((name) => name.match(/default/))
            .forEach((defaultNode) =>
                execSync(`kubectl delete ${defaultNode} --kubeconfig <(echo "${kubeConfig}")`, {shell: '/bin/bash'}),
            );

        execSync(
            `kubectl taint nodes --all "kubernetes.azure.com/scalesetpriority-" --kubeconfig <(echo "${kubeConfig}") 2>/dev/null || true`,
            {shell: '/bin/bash'},
        );
    });
}
