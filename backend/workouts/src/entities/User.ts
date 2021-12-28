import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial} from "typeorm";
import {Exercise} from "./Exercise";
import {Workout} from "./Workout";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @OneToMany("Workout", "owner", {cascade: true})
  workouts: Workout[];

  @OneToMany("Exercise", "owner", {cascade: true})
  exercises: Exercise[];

  addWorkout(data: Omit<DeepPartial<Workout>, "owner">) {
    return Workout.create({owner: this, ...data}).save();
  }

  addWorkouts(data: Omit<DeepPartial<Workout>, "owner">[]) {
    return Promise.all(data.map((val) => Workout.create({owner: this, ...val}).save()));
  }

  async getSerializedWorkouts() {
    const workouts = await Workout.find({owner: this});
    return workouts.map((workout) => workout.serialize());
  }

  async getWorkout(id: string) {
    return Workout.findOne({owner: this, id});
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
