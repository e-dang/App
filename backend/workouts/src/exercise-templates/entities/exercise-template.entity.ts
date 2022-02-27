import {Resource} from "@core/entities";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {Type} from "class-transformer";
import {Column, Entity, Index, ManyToOne, Unique} from "typeorm";

export enum Unit {
  Pound = "lb",
  Kilogram = "kg",
}

@Entity({
  name: "exerciseTemplates",
  orderBy: {
    exerciseGroupId: "ASC",
    index: "ASC",
  },
})
@Unique(["index", "exerciseGroupId"])
export class ExerciseTemplate extends Resource {
  @Column("smallint", {nullable: false})
  index: number;

  @Column("smallint", {nullable: false})
  targetReps: number;

  @Column("smallint", {nullable: false})
  targetSets: number;

  @Column("smallint", {nullable: false})
  targetWeight: number;

  @Column({type: "enum", enum: Unit, nullable: false})
  unit: Unit;

  @ManyToOne("ExerciseGroupTemplate", "exercises", {nullable: false, orphanedRowAction: "delete", onDelete: "CASCADE"})
  exerciseGroup: ExerciseGroupTemplate;

  @Index()
  @Column({nullable: false})
  exerciseGroupId: string;

  @Type(() => ExerciseType)
  @ManyToOne("ExerciseType", "exerciseTemplates", {eager: true, nullable: false})
  type: ExerciseType;

  @Column({nullable: false})
  typeId: string;
}
