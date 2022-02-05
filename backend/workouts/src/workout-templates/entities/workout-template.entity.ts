import {Resource} from "@core/entities/resource.entity";
import {User} from "@core/entities/user.entity";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {Exclude, Expose} from "class-transformer";
import {Column, Entity, Index, ManyToOne, OneToMany, Unique} from "typeorm";

@Entity({name: "workoutTemplates", orderBy: {ownerId: "ASC", name: "ASC"}})
@Unique(["name", "ownerId"])
export class WorkoutTemplate extends Resource {
  @Column("varchar", {length: 255, nullable: false})
  name: string;

  @Column("text", {default: "", nullable: false})
  notes: string;

  @Exclude()
  @ManyToOne("User", "workoutTemplates", {nullable: false})
  owner: User;

  @Index()
  @Column({nullable: false})
  ownerId: string;

  @Expose({groups: ["detail"]})
  @OneToMany("ExerciseGroupTemplate", "workout", {cascade: true})
  exerciseGroups: ExerciseGroupTemplate[];
}
