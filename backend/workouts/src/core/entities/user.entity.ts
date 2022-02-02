import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {Entity, OneToMany, PrimaryColumn} from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn("uuid")
  id: string;

  @OneToMany("WorkoutTemplate", "owner")
  workoutTemplates: WorkoutTemplate[];

  @OneToMany("ExerciseType", "owner")
  exerciseTypes: ExerciseType[];
}
