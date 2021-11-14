import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    lastLogin: string;

    @Column()
    dateJoined: string;

    @Column()
    isActive: boolean;
}
