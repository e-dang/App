import * as pulumi from "@pulumi/pulumi";
import {RoleAssignment} from "@pulumi/azure-native/authorization";
import {ManagedCluster, listManagedClusterAdminCredentials, AgentPool} from "@pulumi/azure-native/containerservice";
import {getResourceGroup} from "@pulumi/azure-native/resources";
import {getZone} from "@pulumi/azure-native/network";
import {execSync} from "child_process";
import {config} from "./config";

const env = pulumi.getStack();

const cluster = new ManagedCluster("aks", {
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
      mode: "System",
      name: "default",
      osType: "Linux",
      type: "VirtualMachineScaleSets",
      vmSize: "Standard_A2_v2",
      vnetSubnetID: config.subnetId,
    },
  ],
  autoScalerProfile: {
    scaleDownDelayAfterAdd: "15m",
    scanInterval: "20s",
  },
  dnsPrefix: `tracker-${env}`,
  enableRBAC: true,
  kubernetesVersion: "1.21.9",
  identity: {
    type: "SystemAssigned",
  },
  resourceGroupName: config.resourceGroupName,
  resourceName: env,
  tags: {
    environment: env,
  },
});

new RoleAssignment("cluster-subnet-access", {
  principalId: cluster.identity.apply((id) => id?.principalId || ""),
  principalType: "ServicePrincipal",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/4d97b98b-1d4f-4787-a291-c67834d212e7", // Network Contributor
  scope: config.subnetId,
});

const domainResourceGroup = getResourceGroup({resourceGroupName: config.domainResourceGroup});

const dnsZone = getZone({
  resourceGroupName: config.domainResourceGroup,
  zoneName: config.dnsZone,
});

new RoleAssignment("kubelet-domain-resouce-group-access", {
  principalId: cluster.identityProfile.apply((conf) => conf?.kubeletidentity.objectId || ""),
  principalType: "ServicePrincipal",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7", // Reader Role,
  scope: domainResourceGroup.then((conf) => conf.id),
});

new RoleAssignment("kubelet-dns-zone-access", {
  principalId: cluster.identityProfile.apply((conf) => conf?.kubeletidentity.objectId || ""),
  principalType: "ServicePrincipal",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/befefa01-2a29-4197-83a8-272ff33ce314", // DNS Contributor
  scope: dnsZone.then((conf) => conf.id),
});

new RoleAssignment("dev-access", {
  principalId: config.devGroupId,
  principalType: "Group",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/4abbcc35-e782-43d8-92c5-2d3f1bd2253f", // Azure Kubernetes Service Cluster User Role
  scope: cluster.id,
});

const creds = pulumi.secret(
  pulumi.all([cluster.name, config.resourceGroupName]).apply(([clusterName, rgName]) => {
    return listManagedClusterAdminCredentials({
      resourceGroupName: rgName,
      resourceName: clusterName,
    });
  }),
);

export const clusterId = cluster.id;
export const kubeConfig = creds.kubeconfigs[0].value.apply((enc) => Buffer.from(enc, "base64").toString());

// This section is running the cluster only on spot nodes in order to decrease the price for development
if (env === "dev") {
  // Add spot node pool
  const spotNodes = new AgentPool("spot-nodes", {
    agentPoolName: "spotnodepool",
    resourceGroupName: config.resourceGroupName,
    resourceName: cluster.name,
    scaleSetPriority: "Spot",
    vmSize: "Standard_A2_v2",
    vnetSubnetID: config.subnetId,
    enableAutoScaling: true,
    count: 2,
    minCount: 1,
    maxCount: 3,
    scaleSetEvictionPolicy: "Delete",
    spotMaxPrice: -1,
    osDiskSizeGB: 32,
  });

  // Delete default node pool and remove spot node taints
  pulumi.all([kubeConfig, spotNodes.id]).apply(([kubeConf]) => {
    const nodes = execSync(`kubectl get nodes -o=name --kubeconfig <(echo "${kubeConf}")`, {
      shell: "/bin/bash",
    }).toString();

    nodes
      .split("\n")
      .filter((name) => name.match(/default/))
      .forEach((defaultNode) =>
        execSync(`kubectl delete ${defaultNode} --kubeconfig <(echo "${kubeConf}")`, {shell: "/bin/bash"}),
      );

    execSync(
      `kubectl taint nodes --all "kubernetes.azure.com/scalesetpriority-" --kubeconfig <(echo "${kubeConf}") 2>/dev/null || true`,
      {shell: "/bin/bash"},
    );
  });
}
