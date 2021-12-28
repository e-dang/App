import * as pulumi from "@pulumi/pulumi";

const env = pulumi.getStack();

const identityStackRef = new pulumi.StackReference("e-dang/identity/base");
const networkStackRef = new pulumi.StackReference(`e-dang/networks/${env}`);

export const config = {
  resourceGroupName: networkStackRef.getOutput("resourceGroupName"),
  adminGroupId: identityStackRef.getOutput("adminGroupId"),
  devGroupId: identityStackRef.getOutput("devGroupId"),
};
