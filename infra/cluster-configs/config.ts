import * as pulumi from '@pulumi/pulumi';

const pulumiConfig = new pulumi.Config();
const env = pulumi.getStack();

const identityStackRef = new pulumi.StackReference('e-dang/identity/base');
const clusterStackRef = new pulumi.StackReference(`e-dang/clusters/${env}`);
const keyStackRef = new pulumi.StackReference(`e-dang/keys/${env}`);

export const config = {
    sopsSecret: pulumiConfig.requireSecret('sops-gpg'),
    githubIdentity: pulumiConfig.requireSecret('githubIdentity'),
    githubIdentityPub: pulumiConfig.requireSecret('githubIdentityPub'),
    githubKnownHosts: pulumiConfig.requireSecret('githubKnownHosts'),
    kubeConfig: clusterStackRef.getOutput('kubeConfig'),
    akvClientId: keyStackRef.getOutput('akvServicePrincipleId'),
    akvClientSecret: keyStackRef.getOutput('akvServicePrincipleSecret'),
    devGroupId: identityStackRef.getOutput('devGroupId'),
    branch: pulumiConfig.require('branch'),
};
