import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial} from "typeorm";
import {Exercise} from "./Exercise";
import {WorkoutTemplate} from "./WorkoutTemplate";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @OneToMany("WorkoutTemplate", "owner", {cascade: true})
  workoutTemplates: WorkoutTemplate[];

  @OneToMany("Exercise", "owner", {cascade: true})
  exercises: Exercise[];

  addWorkoutTemplate(data: Omit<DeepPartial<WorkoutTemplate>, "owner">) {
    return WorkoutTemplate.create({owner: this, ...data}).save();
  }

  addWorkoutTemplates(data: Omit<DeepPartial<WorkoutTemplate>, "owner">[]) {
    return Promise.all(data.map((val) => WorkoutTemplate.create({owner: this, ...val}).save()));
  }

  async getSerializedWorkoutTemplates() {
    const workouts = await WorkoutTemplate.find({owner: this});
    return workouts.map((workout) => workout.serialize());
  }

  async getWorkoutTemplate(id: string) {
    return WorkoutTemplate.findOne({owner: this, id});
  }

  addExercise(data: Omit<DeepPartial<Exercise>, "owner">) {
    return Exercise.create({owner: this, ...data}).save();
  }

  addExercises(data: Omit<DeepPartial<Exercise>, "owner">[]) {
    return Promise.all(data.map((val) => Exercise.create({owner: this, ...val}).save()));
  }

  async getSerializedExercises() {
    return (await Exercise.find({owner: this})).map((exericse) => exericse.serialize());
  }

  async getExercise(properties: Omit<Partial<Exercise>, "owner">) {
    return Exercise.findOne({...properties, owner: this});
  }
}
