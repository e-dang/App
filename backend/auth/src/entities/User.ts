import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', {length: 255})
    name: string;

    @Column('varchar', {length: 255, unique: true})
    email: string;

    @Column()
    password: string;

    @Column('timestamp without time zone')
    lastLogin: string;

    @CreateDateColumn()
    dateJoined: string;

    @Column()
    isActive: boolean;

    @Column('int', {default: 0})
    tokenVersion: number;
}
