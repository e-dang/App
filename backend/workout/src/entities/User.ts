import {Entity, PrimaryColumn, BaseEntity, OneToMany, DeepPartial} from 'typeorm';
import {Workout} from './Workout';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @OneToMany(() => Workout, (workout) => workout.owner, {cascade: true})
    workouts: Workout[];

    async addWorkout(entityLike: Omit<DeepPartial<Workout>, 'owner'>) {
        return (await this.addWorkouts([entityLike]))[0];
    }

    async addWorkouts(entityLike: Omit<DeepPartial<Workout>, 'owner'>[]) {
        this.workouts = entityLike.map((data) => Workout.create({owner: this, ...data}));
        await this.save();
        return this.workouts;
    }

    async getSerializedWorkouts() {
        const workouts = await Workout.find({owner: this});
        return workouts.map((workout) => workout.serialize());
    }

    async getWorkout(id: string) {
        return Workout.findOne({owner: this, id});
    }
}
