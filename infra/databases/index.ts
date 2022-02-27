import * as pulumi from "@pulumi/pulumi";
import * as postgresql from "@pulumi/azure/postgresql";
import {config} from "./config";

const env = pulumi.getStack();

// Currently azure native package doesn't support the postgres flexible server database.
// Using azure package instead and leaving commented out azure native code below

const trackerServer = new postgresql.FlexibleServer("tracker-server", {
  name: `tracker-${env}`,
  resourceGroupName: config.resourceGroupName,
  delegatedSubnetId: config.subnetId,
  privateDnsZoneId: config.privateDnsId,
  administratorLogin: config.adminLogin,
  administratorPassword: config.adminPassword,
  skuName: "B_Standard_B1ms",
  version: "13",
  storageMb: 32768,
  backupRetentionDays: 7,
});

new postgresql.FlexibleServerDatabase("tracker-database", {
  name: "tracker",
  serverId: trackerServer.id,
  collation: "en_US.utf8",
  charset: "utf8",
});

new postgresql.FlexibleServerDatabase("workouts-database", {
  name: "workouts",
  serverId: trackerServer.id,
  collation: "en_US.utf8",
  charset: "utf8",
});

// const trackerServer = new azure.dbforpostgresql.v20210601.Server('tracker-server', {
//     resourceGroupName: config.resourceGroupName,
//     serverName: `tracker-${env}`,
//     sku: {
//         name: 'Standard_B1ms',
//         tier: 'Burstable',
//     },
//     storage: {
//         storageSizeGB: 32,
//     },
//     backup: {
//         backupRetentionDays: 7,
//     },
//     network: {
//         delegatedSubnetResourceId: config.subnetId,
//         privateDnsZoneArmResourceId: config.privateDnsId,
//     },
//     administratorLogin: config.adminLogin,
//     administratorLoginPassword: config.adminPassword,
//     version: '13',
// });

// const trackerDb = new azure.dbforpostgresql.v20210601.Database('tracker-db', {
//     databaseName: 'tracker',
//     resourceGroupName: config.resourceGroupName,
//     serverName: trackerServer.name,
//     charset: 'utf8',
//     collation: 'en-US',
// });
