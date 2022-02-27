import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

const config = new pulumi.Config();
const env = pulumi.getStack();

const resourceGroup = new azure.resources.ResourceGroup("stack", {
  resourceGroupName: `${env}-stack`,
});

const vnet = new azure.network.VirtualNetwork("network", {
  addressSpace: {
    addressPrefixes: config.requireObject<string[]>("vnetAddresses"),
  },
  resourceGroupName: resourceGroup.name,
  virtualNetworkName: `vnet-${env}`,
});

const clusterSubnet = new azure.network.Subnet("cluster-subnet", {
  subnetName: "cluster-subnet",
  resourceGroupName: resourceGroup.name,
  virtualNetworkName: vnet.name,
  addressPrefix: config.require("clusterSubnetPrefix"),
});

const trackerDbSubnet = new azure.network.Subnet("tracker-db-subnet", {
  subnetName: "tracker-db-subnet",
  resourceGroupName: resourceGroup.name,
  virtualNetworkName: vnet.name,
  addressPrefix: config.require("trackerDbSubnetPrefix"),
  serviceEndpoints: [{service: "Microsoft.Storage"}],
  delegations: [
    {
      name: `tracker-${env}`,
      serviceName: "Microsoft.DBforPostgreSQL/flexibleServers",
    },
  ],
});

const vpnGatewaySubnet = new azure.network.Subnet("GatewaySubnet", {
  name: "vpn-gateway-subnet",
  virtualNetworkName: vnet.name,
  resourceGroupName: resourceGroup.name,
  addressPrefix: config.require("vpnGatewaySubnetPrefix"),
});

const publicIp = new azure.network.PublicIPAddress("vpn-gateway-public-ip", {
  resourceGroupName: resourceGroup.name,
});

new azure.network.VirtualNetworkGateway("vpn-gateway", {
  resourceGroupName: resourceGroup.name,
  gatewayType: "Vpn",
  vpnType: "RouteBased",
  sku: {
    name: "VpnGw1",
    tier: "VpnGw1",
  },
  virtualNetworkGatewayName: "vpnGateway",
  ipConfigurations: [
    {
      name: "vpngwipconfig",
      privateIPAllocationMethod: "Dynamic",
      publicIPAddress: {
        id: publicIp.id,
      },
      subnet: {
        id: vpnGatewaySubnet.id,
      },
    },
  ],
  enableBgp: false,
  activeActive: false,
});

const privateDns = new azure.network.PrivateZone("private-dns", {
  location: "Global",
  privateZoneName: `${env}.postgres.database.azure.com`,
  resourceGroupName: resourceGroup.name,
});

new azure.network.VirtualNetworkLink("private-dns-link", {
  location: "Global",
  virtualNetworkLinkName: `${env}-link`,
  registrationEnabled: true,
  privateZoneName: privateDns.name,
  virtualNetwork: {id: vnet.id},
  resourceGroupName: resourceGroup.name,
});

export const resourceGroupId = resourceGroup.id;
export const resourceGroupName = resourceGroup.name;
export const vnetId = vnet.id;
export const clusterSubnetId = clusterSubnet.id;
export const trackerDbSubnetId = trackerDbSubnet.id;
export const trackerDbPrivateDnsId = privateDns.id;
