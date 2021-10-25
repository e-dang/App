import * as pulumi from '@pulumi/pulumi';
import * as keyvault from '@pulumi/azure-native/keyvault';
import * as authorization from '@pulumi/azure-native/authorization';
import * as random from '@pulumi/random';
import * as azuread from '@pulumi/azuread';
import {config} from './config';

const currentPrincipal = azuread.getClientConfig().then((config) => config.objectId);
const tenantId = authorization.getClientConfig().then((config) => config.tenantId);
const env = pulumi.getStack();

const vaultHex = new random.RandomId('vault-id', {
    byteLength: 8,
});

const vault = new keyvault.Vault('vault', {
    vaultName: pulumi.interpolate`${env}-${vaultHex.hex}`,
    resourceGroupName: config.resourceGroupName,
    properties: {
        sku: {
            family: 'A',
            name: 'standard',
        },
        tenantId,
        enableRbacAuthorization: true,
    },
    tags: {
        environment: env,
    },
});

const key = new keyvault.Key('key', {
    keyName: 'tracker-sops',
    resourceGroupName: config.resourceGroupName,
    vaultName: vault.name,
    properties: {
        keySize: 2048,
        kty: 'RSA',
    },
    tags: {
        environment: env,
    },
});

const akvApplication = new azuread.Application('akv-application', {
    displayName: 'akv-sops-decryption',
    owners: [currentPrincipal],
});

const akvServicePrincipal = new azuread.ServicePrincipal('akv-serviceprincipal', {
    applicationId: akvApplication.applicationId,
    appRoleAssignmentRequired: false,
    owners: [currentPrincipal],
});

const akvServicePrincipalPassword = new azuread.ServicePrincipalPassword('akv-serviceprincipal-password', {
    servicePrincipalId: akvServicePrincipal.id,
});

const akvKeyVaultAccess = new authorization.RoleAssignment('akv-keyvault', {
    principalId: akvServicePrincipal.id,
    principalType: 'ServicePrincipal',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/12338af0-0e69-4776-bea7-57ae8d297424', // Key Vault Crypto User
    scope: vault.id,
});

const adminAccess = new authorization.RoleAssignment('admin-access', {
    principalId: config.adminGroupId,
    principalType: 'Group',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/00482a5a-887f-4fb3-b363-3b7fe8e74483', // Key Vault Administrator
    scope: vault.id,
});

const devAccess = new authorization.RoleAssignment('dev-access', {
    principalId: config.devGroupId,
    principalType: 'Group',
    roleDefinitionId: '/providers/Microsoft.Authorization/roleDefinitions/12338af0-0e69-4776-bea7-57ae8d297424', // Key Vault Crypto User
    scope: vault.id,
});

export const vaultId = vault.id;
export const keyUri = key.keyUri;
export const akvServicePrincipleId = akvApplication.applicationId;
export const akvServicePrincipleSecret = akvServicePrincipalPassword.value;
