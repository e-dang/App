import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial} from 'typeorm';
import {Workout} from './Workout';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @OneToMany(() => Workout, (workout) => workout.owner, {cascade: true})
    workouts: Workout[];

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
}
