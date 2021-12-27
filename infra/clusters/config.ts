import * as pulumi from "@pulumi/pulumi";

const pulumiConfig = new pulumi.Config();
const env = pulumi.getStack();

const identityStackRef = new pulumi.StackReference("e-dang/identity/base");
const networkStackRef = new pulumi.StackReference(`e-dang/networks/${env}`);

export const config = {
  resourceGroupName: networkStackRef.getOutput("resourceGroupName"),
  subnetId: networkStackRef.getOutput("clusterSubnetId"),
  adminGroupId: identityStackRef.getOutput("adminGroupId"),
  devGroupId: identityStackRef.getOutput("devGroupId"),
  domainResourceGroup: pulumiConfig.require("domainResourceGroup"),
  dnsZone: pulumiConfig.require("dnsZone"),
};
