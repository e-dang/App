import * as pulumi from "@pulumi/pulumi";
import * as keyvault from "@pulumi/azure-native/keyvault";
import * as authorization from "@pulumi/azure-native/authorization";
import * as random from "@pulumi/random";
import * as azuread from "@pulumi/azuread";
import {config} from "./config";

const currentPrincipal = azuread.getClientConfig().then((conf) => conf.objectId);
const tenantId = authorization.getClientConfig().then((conf) => conf.tenantId);
const env = pulumi.getStack();

const fluxVaultHex = new random.RandomId("flux-vault-id", {
  byteLength: 5,
});

const fluxVault = new keyvault.Vault("flux-vault", {
  vaultName: pulumi.interpolate`flux-${env}-${fluxVaultHex.hex}`,
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

const fluxAuthSops = new keyvault.Key("flux-auth-sops", {
  keyName: "auth-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: fluxVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
  tags: {
    environment: env,
  },
});

const fluxWorksoutsSops = new keyvault.Key("flux-workouts-sops", {
  keyName: "workouts-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: fluxVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
  tags: {
    environment: env,
  },
});

const fluxExternalDnsSops = new keyvault.Key("flux-external-dns-sops", {
  keyName: "external-dns-sops",
  resourceGroupName: config.resourceGroupName,
  vaultName: fluxVault.name,
  properties: {
    keySize: 2048,
    kty: "RSA",
  },
  tags: {
    environment: env,
  },
});

const akvApplication = new azuread.Application("akv-application", {
  displayName: "akv-sops-decryption",
  owners: [currentPrincipal],
});

const akvServicePrincipal = new azuread.ServicePrincipal("akv-serviceprincipal", {
  applicationId: akvApplication.applicationId,
  appRoleAssignmentRequired: false,
  owners: [currentPrincipal],
});

const akvServicePrincipalPassword = new azuread.ServicePrincipalPassword("akv-serviceprincipal-password", {
  servicePrincipalId: akvServicePrincipal.id,
});

const _serviceAccess = new authorization.RoleAssignment("service-access", {
  principalId: akvServicePrincipal.id,
  principalType: "ServicePrincipal",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/12338af0-0e69-4776-bea7-57ae8d297424", // Key Vault Crypto User
  scope: fluxVault.id,
});

const _adminAccess = new authorization.RoleAssignment("admin-access", {
  principalId: config.adminGroupId,
  principalType: "Group",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483", // Key Vault Administrator
  scope: fluxVault.id,
});

const _devAccess = new authorization.RoleAssignment("dev-access", {
  principalId: config.devGroupId,
  principalType: "Group",
  roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/12338af0-0e69-4776-bea7-57ae8d297424", // Key Vault Crypto User
  scope: fluxVault.id,
});

export const fluxVaultId = fluxVault.id;
export const authSopsUri = fluxAuthSops.keyUriWithVersion;
export const workoutsSopsUri = fluxWorksoutsSops.keyUriWithVersion;
export const externalDnsSopsUri = fluxExternalDnsSops.keyUriWithVersion;
export const akvFluxServicePrincipleId = akvApplication.applicationId;
export const akvFluxServicePrincipleSecret = akvServicePrincipalPassword.value;
