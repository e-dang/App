import * as pulumi from '@pulumi/pulumi';
import {DecryptedSecret, decryptSopsFile, PulumiSecret} from '../utils';

interface GithubDeployKey extends DecryptedSecret {
    identity: PulumiSecret;
    identityPub: PulumiSecret;
    knownHosts: PulumiSecret;
}

interface GithubToken extends DecryptedSecret {
    token: PulumiSecret;
}

const pulumiConfig = new pulumi.Config();
const env = pulumi.getStack();

const identityStackRef = new pulumi.StackReference('e-dang/identity/base');
const clusterStackRef = new pulumi.StackReference(`e-dang/clusters/${env}`);
const keyStackRef = new pulumi.StackReference(`e-dang/keys/${env}`);
const githubDeployKey = decryptSopsFile<GithubDeployKey>('./files/github-deploy-key.yaml');
const githubToken = decryptSopsFile<GithubToken>('./files/github-token.yaml');

export const config = {
    githubIdentity: githubDeployKey.identity,
    githubIdentityPub: githubDeployKey.identityPub,
    githubKnownHosts: githubDeployKey.knownHosts,
    githubOwner: pulumiConfig.require('githubOwner'),
    githubToken: githubToken.token,
    fluxVersion: pulumiConfig.require('fluxVersion'),
    kubeConfig: clusterStackRef.getOutput('kubeConfig'),
    akvClientId: keyStackRef.getOutput('akvFluxServicePrincipleId'),
    akvClientSecret: keyStackRef.getOutput('akvFluxServicePrincipleSecret'),
    devGroupId: identityStackRef.getOutput('devGroupId'),
    branch: pulumiConfig.require('branch'),
};
