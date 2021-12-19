import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial} from 'typeorm';
import {Exercise} from './Exercise';
import {Workout} from './Workout';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @OneToMany(() => Workout, (workout) => workout.owner, {cascade: true})
    workouts: Workout[];

    @OneToMany(() => Exercise, (exercise) => exercise.owner, {cascade: true})
    exercises: Exercise[];

    async addWorkout(entityLike: Omit<DeepPartial<Workout>, 'owner'>) {
        return await Workout.create({owner: this, ...entityLike}).save();
    }

    async addWorkouts(entityLike: Omit<DeepPartial<Workout>, 'owner'>[]) {
        return await Promise.all(entityLike.map((data) => Workout.create({owner: this, ...data}).save()));
    }

    async getSerializedWorkouts() {
        const workouts = await Workout.find({owner: this});
        return workouts.map((workout) => workout.serialize());
    }

    async getWorkout(id: string) {
        return Workout.findOne({owner: this, id});
    }

    async addExercise(data: Omit<DeepPartial<Exercise>, 'owner'>) {
        return await Exercise.create({owner: this, ...data}).save();
    }

    async addExercises(data: Omit<DeepPartial<Exercise>, 'owner'>[]) {
        return await Promise.all(data.map((data) => Exercise.create({owner: this, ...data}).save()));
    }

    async getSerializedExercises() {
        return (await Exercise.find({owner: this})).map((exericse) => exericse.serialize());
    }

    async getExercise(properties: Omit<Partial<Exercise>, 'owner'>) {
        return Exercise.findOne({...properties, owner: this});
    }
}
