import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './User';

interface WorkoutDetail {
    id: string;
    owner: string;
    name: string;
}

@Entity('workouts')
export class Workout extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    ownerId: string;

    @ManyToOne(() => User, (user) => user.workouts)
    owner: User;

    @Column('varchar', {length: 255})
    name: string;

    @Column({default: false})
    isDeleted: boolean;

    serialize(): WorkoutDetail {
        return {
            id: this.id,
            owner: this.ownerId,
            name: this.name,
        };
    }
}
