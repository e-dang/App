import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {ExerciseTemplate} from "./ExerciseTemplate";
import type {User} from "./User";

export interface ExerciseTypeDetail {
  id: string;
  owner: string;
  name: string;
  createdAt: string;
  lastUpdatedAt: string;
}

@Entity("exerciseTypes")
export class ExerciseType extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({nullable: true})
  ownerId: string;

  @ManyToOne("User", "exercises")
  owner: User;

  @Column("varchar", {length: 255})
  name: string;

  @CreateDateColumn({type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamptz"})
  lastUpdatedAt: Date;

  @DeleteDateColumn({type: "timestamptz"})
  deletedAt: Date;

  @OneToMany("ExerciseTemplate", "type")
  exerciseTemplates: ExerciseTemplate[];

  serialize(): ExerciseTypeDetail {
    return {
      id: this.id,
      owner: this.ownerId,
      name: this.name,
      createdAt: this.createdAt.toString(),
      lastUpdatedAt: this.lastUpdatedAt.toString(),
    };
  }
}
