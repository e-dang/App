import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import {User} from './User';

interface WorkoutDetail {
    id: string;
    owner: string;
    name: string;
    createdAt: string;
    lastUpdatedAt: string;
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

    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    lastUpdatedAt: Date;

    serialize(): WorkoutDetail {
        return {
            id: this.id,
            owner: this.ownerId,
            name: this.name,
            createdAt: this.createdAt.toString(),
            lastUpdatedAt: this.lastUpdatedAt.toString(),
        };
    }
}
