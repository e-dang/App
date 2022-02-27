import {Resource} from "@core/entities";
import {ExerciseTemplate} from "@exercise-templates/entities/exercise-template.entity";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {Type} from "class-transformer";
import {Column, Entity, Index, ManyToOne, OneToMany, Unique} from "typeorm";

@Entity({name: "exerciseGroupTemplates", orderBy: {workoutId: "ASC", index: "ASC"}})
@Unique(["index", "workoutId"])
export class ExerciseGroupTemplate extends Resource {
  @Column("smallint", {nullable: false})
  index: number;

  @ManyToOne("WorkoutTemplate", "exerciseGroups", {nullable: false, orphanedRowAction: "delete", onDelete: "CASCADE"})
  workout: WorkoutTemplate;

  @Index()
  @Column({nullable: false})
  workoutId: string;

  @Type(() => ExerciseTemplate)
  @OneToMany("ExerciseTemplate", "exerciseGroup", {cascade: true, eager: true})
  exercises: ExerciseTemplate[];
}
