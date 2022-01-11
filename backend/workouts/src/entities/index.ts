import {User} from "./User";
import {WorkoutTemplate} from "./WorkoutTemplate";
import {ExerciseGroupTemplate} from "./ExerciseGroupTemplate";
import {ExerciseTemplate} from "./ExerciseTemplate";
import {ExerciseType} from "./ExerciseType";

export const entities = [User, WorkoutTemplate, ExerciseGroupTemplate, ExerciseTemplate, ExerciseType];
export * from "./User";
export * from "./WorkoutTemplate";
export * from "./ExerciseGroupTemplate";
export * from "./ExerciseTemplate";
export * from "./ExerciseType";
