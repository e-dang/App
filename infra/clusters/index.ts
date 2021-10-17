import * as pulumi from '@pulumi/pulumi';
import * as authorization from '@pulumi/azure-native/authorization';
import * as containerservice from '@pulumi/azure-native/containerservice';
import {config} from './config';

const env = pulumi.getStack();

const cluster = new containerservice.ManagedCluster('aks', {
    aadProfile: {
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

const adminAccess = new authorization.RoleAssignment('admin-access', {
    principalId: config.adminGroupId,
    principalType: 'Group',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/b1ff04bb-8a4e-4dc4-8eb5-8693973ce19b', // Azure Kubernetes Service RBAC Cluster Admin
    scope: cluster.id,
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
