import {ApiGroup} from './types';
import {authApis} from './auth';
import {userApis} from './users';

export const apis: ApiGroup[] = [authApis, userApis];
export * from './auth';
export * from './users';
export * from './types';
