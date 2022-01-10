import {Entity} from "./entity";
import {CreateExerciseTemplateForm, ExerciseTemplate} from "./exercise";

interface ExerciseGroupProperties<T> {
  index: number;
  exercises: T[];
}

export interface ExerciseGroupTemplate extends Entity, ExerciseGroupProperties<ExerciseTemplate> {}

export type CreateExerciseGroupTemplateForm = ExerciseGroupProperties<CreateExerciseTemplateForm>;
