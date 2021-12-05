import {Entity, PrimaryColumn, BaseEntity, OneToMany} from 'typeorm';
import {Workout} from './Workout';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;

    @OneToMany(() => Workout, (workout) => workout.owner)
    workouts: Workout[];
}
