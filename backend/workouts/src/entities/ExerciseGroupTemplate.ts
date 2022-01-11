import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {Resource, ResourceDetail} from "./Resource";
import type {WorkoutTemplate} from "./WorkoutTemplate";
import type {ExerciseTemplate, ExerciseTemplateDetail} from "./ExerciseTemplate";

export interface ExerciseGroupTemplateDetail extends ResourceDetail {
  index: number;
  exercises: ExerciseTemplateDetail[];
}

@Entity("exerciseGroupTemplates")
export class ExerciseGroupTemplate extends Resource {
  @Column("smallint", {nullable: false})
  index: number;

  @Column({nullable: false})
  workoutId: string;

  @ManyToOne("WorkoutTemplate", "exerciseGroups")
  workout: WorkoutTemplate;

  @OneToMany("ExerciseTemplate", "exerciseGroup", {cascade: true, eager: true})
  exercises: ExerciseTemplate[];

  serialize() {
    return {
      id: this.id,
      index: this.index,
      exercises: this.exercises.map((exercise) => exercise.serialize()),
      createdAt: this.createdAt.toString(),
      lastUpdatedAt: this.lastUpdatedAt.toString(),
    } as ExerciseGroupTemplateDetail;
  }
}
