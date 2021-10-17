import * as pulumi from '@pulumi/pulumi';

const pulumiConfig = new pulumi.Config();
const env = pulumi.getStack();

const identityStackRef = new pulumi.StackReference('e-dang/identity/base');
const clusterStackRef = new pulumi.StackReference(`e-dang/clusters/${env}`);

export const config = {
    sopsSecret: pulumiConfig.requireSecret('sops-gpg'),
    githubIdentity: pulumiConfig.requireSecret('githubIdentity'),
    githubIdentityPub: pulumiConfig.requireSecret('githubIdentityPub'),
    githubKnownHosts: pulumiConfig.requireSecret('githubKnownHosts'),
    kubeConfig: clusterStackRef.getOutput('kubeConfig'),
    devGroupId: identityStackRef.getOutput('devGroupId'),
    branch: pulumiConfig.require('branch'),
};
