import * as pulumi from '@pulumi/pulumi';
import * as azure from '@pulumi/azure-native';

const config = new pulumi.Config();
const env = pulumi.getStack();

const resourceGroup = new azure.resources.ResourceGroup('stack', {
    resourceGroupName: `${env}-stack`,
});

const vnet = new azure.network.VirtualNetwork('network', {
    addressSpace: {
        addressPrefixes: config.requireObject<string[]>('vnetAddresses'),
    },
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: `vnet-${env}`,
});

const clusterSubnet = new azure.network.Subnet('cluster-subnet', {
    subnetName: 'cluster-subnet',
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: vnet.name,
    addressPrefix: config.require('clusterSubnetPrefix'),
});

export const resourceGroupId = resourceGroup.id;
export const resourceGroupName = resourceGroup.name;
export const vnetId = vnet.id;
export const clusterSubnetId = clusterSubnet.id;
