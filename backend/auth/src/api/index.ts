import {ApiGroup} from "./types";
import {authApis} from "./auth";
import {userApis} from "./user";

export const apis: ApiGroup[] = [authApis, userApis];

export * from "./auth";
export * from "./user";
export * from "./types";
