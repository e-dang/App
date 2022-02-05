import {Entity} from "./entity";
import {CreateExerciseGroupTemplateForm, ExerciseGroupTemplate} from "./exerciseGroup";

interface WorkoutTemplateProperties<T> {
  name: string;
  notes: string;
  exerciseGroups: T[];
}

export interface WorkoutTemplate extends Entity, WorkoutTemplateProperties<ExerciseGroupTemplate> {}

export type CreateWorkoutTemplateForm = WorkoutTemplateProperties<CreateExerciseGroupTemplateForm>;
