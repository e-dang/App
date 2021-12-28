import * as pulumi from "@pulumi/pulumi";
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as authorization from "@pulumi/azure-native/authorization";
import * as random from "@pulumi/random";
import {config} from "./config";

const tenantId = authorization.getClientConfig().then((conf) => conf.tenantId);
const env = pulumi.getStack();

const infraVaultHex = new random.RandomId("infra-vault-id", {
  byteLength: 5,
});

const infraVault = new keyvault.Vault("infra-vault", {
  vaultName: pulumi.interpolate`infra-${env}-${infraVaultHex.hex}`,
  resourceGroupName: config.resourceGroupName,
  properties: {
    sku: {
      family: "A",
      name: "standard",
    },
    tenantId,
    enableRbacAuthorization: true,
  },
  tags: {
    environment: env,
  },
});

const dbCredsSops = new keyvault.Key("db-creds-sops", {
  keyName: "tracker-db-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: infraVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
  tags: {
    environment: env,
  },
});

const githubDeployKeySops = new keyvault.Key("github-deploy-key-sops", {
  keyName: "github-deploy-key-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: infraVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
});

const githubTokenSops = new keyvault.Key("github-token-sops", {
  keyName: "github-token-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: infraVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
});

const _adminAccess = new authorization.RoleAssignment("infra-kv-admin-access", {
  principalId: config.adminGroupId,
  principalType: "Group",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483", // Key Vault Administrator
  scope: infraVault.id,
});

export const dbCredsSopsUri = dbCredsSops.keyUriWithVersion;
export const githubDeployKeySopsUri = githubDeployKeySops.keyUriWithVersion;
export const githubTokenSopsUri = githubTokenSops.keyUriWithVersion;
