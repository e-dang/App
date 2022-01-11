import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial, FindOneOptions} from "typeorm";
import {ExerciseType} from "./ExerciseType";
import {WorkoutTemplate} from "./WorkoutTemplate";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
  id: string;

  @OneToMany("WorkoutTemplate", "owner", {cascade: true})
  workoutTemplates: WorkoutTemplate[];

  @OneToMany("ExerciseType", "owner", {cascade: true})
  exerciseTypes: ExerciseType[];

  addWorkoutTemplate(data: Omit<DeepPartial<WorkoutTemplate>, "owner">) {
    return WorkoutTemplate.create({...data, owner: this}).save();
  }

  addWorkoutTemplates(data: Omit<DeepPartial<WorkoutTemplate>, "owner">[]) {
    return Promise.all(data.map((val) => WorkoutTemplate.create({owner: this, ...val}).save()));
  }

  async getSerializedWorkoutTemplates() {
    const workouts = await WorkoutTemplate.find({owner: this});
    return workouts.map((workout) => workout.serialize());
  }

  async getWorkoutTemplate(id: string, options?: FindOneOptions<WorkoutTemplate>) {
    return WorkoutTemplate.findOne({owner: this, id}, options);
  }

  addExerciseType(data: Omit<DeepPartial<ExerciseType>, "owner">) {
    return ExerciseType.create({owner: this, ...data}).save();
  }

  addExerciseTypes(data: Omit<DeepPartial<ExerciseType>, "owner">[]) {
    return Promise.all(data.map((val) => ExerciseType.create({owner: this, ...val}).save()));
  }

  async getSerializedExerciseTypes() {
    return (await ExerciseType.find({owner: this})).map((exericse) => exericse.serialize());
  }

  async getExerciseType(properties: Omit<Partial<ExerciseType>, "owner">) {
    return ExerciseType.findOne({...properties, owner: this});
  }
}
