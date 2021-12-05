import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './User';

@Entity('workouts')
export class Workout extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.workouts)
    owner: User;

    @Column('varchar', {length: 255})
    name: string;

    @Column({default: false})
    isDeleted: boolean;
}
