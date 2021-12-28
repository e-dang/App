import {exerciseApi} from "./exerciseApi";
import {ApiGroup} from "./types";
import {workoutApis} from "./workoutApi";

export const apis: ApiGroup[] = [workoutApis, exerciseApi];

export * from "./types";
