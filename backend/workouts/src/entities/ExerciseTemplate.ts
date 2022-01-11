import {Column, Entity, ManyToOne} from "typeorm";
import {Resource, ResourceDetail} from "./Resource";
import type {ExerciseGroupTemplate} from "./ExerciseGroupTemplate";
import type {ExerciseType, ExerciseTypeDetail} from "./ExerciseType";

export interface ExerciseTemplateDetail extends ResourceDetail {
  targetReps: number;
  targetSets: number;
  targetWeight: number;
  type: ExerciseTypeDetail;
}

@Entity("exerciseTemplates")
export class ExerciseTemplate extends Resource {
  @Column("smallint", {nullable: false})
  targetReps: number;

  @Column("smallint", {nullable: false})
  targetSets: number;

  @Column("smallint", {nullable: false})
  targetWeight: number;

  @Column({nullable: false})
  typeId: string;

  @ManyToOne("ExerciseType", "exerciseTemplates", {eager: true})
  type: ExerciseType;

  @ManyToOne("ExerciseGroupTemplate", "exercises")
  exerciseGroup: Promise<ExerciseGroupTemplate>;

  serialize() {
    return {
      id: this.id,
      targetReps: this.targetReps,
      targetSets: this.targetSets,
      targetWeight: this.targetWeight,
      type: this.type.serialize(),
      createdAt: this.createdAt.toString(),
      lastUpdatedAt: this.lastUpdatedAt.toString(),
    } as ExerciseTemplateDetail;
  }
}
