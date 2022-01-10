import {Entity} from "./entity";

export interface ExerciseType extends Entity {
  name: string;
}

export interface ExerciseTemplateProperties {
  targetReps: number;
  targetSets: number;
  targetWeight: number;
  type: ExerciseType;
}

export interface ExerciseTemplate extends Entity, ExerciseTemplateProperties {}

export type CreateExerciseTemplateForm = ExerciseTemplateProperties;
