import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import * as azuread from "@pulumi/azuread";

interface User extends azuread.UserArgs {
  groups: string[];
}

const config = new pulumi.Config();
const usersRaw = config.requireObject<User[]>("users");
const currentPrincipal = azure.authorization.getClientConfig().then((current) => current.objectId);

const users = usersRaw.map((user) => ({
  userObj: new azuread.User("user", {
    userPrincipalName: user.userPrincipalName,
    displayName: user.displayName,
    password: user.password,
  }),
  groups: user.groups,
}));

const admins = new azuread.Group("admins", {
  displayName: "admins",
  members: [
    currentPrincipal,
    ...users.filter((user) => user.groups.includes("admins")).map((user) => user.userObj.objectId),
  ],
  securityEnabled: true,
});

const devs = new azuread.Group("devs", {
  displayName: "devs",
  members: users.filter((user) => user.groups.includes("devs")).map((user) => user.userObj.objectId),
  securityEnabled: true,
});

export const adminGroupId = admins.objectId;
export const devGroupId = devs.objectId;
