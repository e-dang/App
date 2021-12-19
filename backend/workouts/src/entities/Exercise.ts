import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {User} from './User';

interface ExerciseDetail {
    id: string;
    owner: string;
    name: string;
    createdAt: string;
    lastUpdatedAt: string;
}

@Entity('exercises')
export class Exercise extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({nullable: true})
    ownerId: string;

    @ManyToOne(() => User, (user) => user.exercises)
    owner: User;

    @Column('varchar', {length: 255})
    name: string;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    lastUpdatedAt: Date;

    @DeleteDateColumn({type: 'timestamptz'})
    deletedAt: Date;

    serialize(): ExerciseDetail {
        return {
            id: this.id,
            owner: this.ownerId,
            name: this.name,
            createdAt: this.createdAt.toString(),
            lastUpdatedAt: this.lastUpdatedAt.toString(),
        };
    }
}
