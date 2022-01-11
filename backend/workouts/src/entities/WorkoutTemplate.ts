import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import {ExerciseGroupTemplate, ExerciseGroupTemplateDetail} from "./ExerciseGroupTemplate";
import type {User} from "./User";

export interface WorkoutTemplateDetail {
  id: string;
  ownerId: string;
  name: string;
  exerciseGroups: ExerciseGroupTemplateDetail[];
  createdAt: string;
  lastUpdatedAt: string;
}

@Entity("workoutTemplates")
export class WorkoutTemplate extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({nullable: true})
  ownerId: string;

  @ManyToOne("User", "workouts", {nullable: false})
  owner: User;

  @Column("varchar", {length: 255})
  name: string;

  @OneToMany("ExerciseGroupTemplate", "workout", {cascade: true})
  exerciseGroups: ExerciseGroupTemplate[];

  @Column({default: false})
  isDeleted: boolean;

  @CreateDateColumn({type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamptz"})
  lastUpdatedAt: Date;

  serialize() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      exerciseGroups: this.exerciseGroups.map((group) => group.serialize()),
      createdAt: this.createdAt.toString(),
      lastUpdatedAt: this.lastUpdatedAt.toString(),
    } as WorkoutTemplateDetail;
  }
}
