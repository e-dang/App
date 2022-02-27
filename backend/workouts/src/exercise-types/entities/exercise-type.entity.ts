import {User, Resource} from "@core/entities";
import {ExerciseTemplate} from "@exercise-templates/entities/exercise-template.entity";
import {Exclude} from "class-transformer";
import {Column, Entity, Index, ManyToOne, OneToMany, Unique} from "typeorm";

@Entity({
  name: "exerciseTypes",
  orderBy: {
    ownerId: "ASC",
    name: "ASC",
  },
})
@Unique(["name", "ownerId"])
export class ExerciseType extends Resource {
  @Index()
  @Column("varchar", {length: 255, nullable: false})
  name: string;

  @Exclude()
  @ManyToOne("User", "exerciseTypes", {nullable: false})
  owner: User;

  @Index()
  @Column({nullable: false})
  ownerId: string;

  @Exclude()
  @OneToMany("ExerciseTemplate", "type")
  exerciseTemplates: ExerciseTemplate[];
}
