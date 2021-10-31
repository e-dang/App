import * as pulumi from '@pulumi/pulumi';
import {DecryptedSecret, decryptSopsFile, PulumiSecret} from '../utils';

interface DatabaseCreds extends DecryptedSecret {
    adminLogin: PulumiSecret;
    adminPassword: PulumiSecret;
}

const env = pulumi.getStack();

const networkStackRef = new pulumi.StackReference(`e-dang/networks/${env}`);
const dbCreds = decryptSopsFile<DatabaseCreds>(`./files/db-creds-${env}.yaml`);

export const config = {
    resourceGroupName: networkStackRef.getOutput('resourceGroupName'),
    subnetId: networkStackRef.getOutput('trackerDbSubnetId'),
    privateDnsId: networkStackRef.getOutput('trackerDbPrivateDnsId'),
    adminLogin: dbCreds.adminLogin,
    adminPassword: dbCreds.adminPassword,
};
