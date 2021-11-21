import {hashPassword} from '@auth';
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

    @Column({default: true})
    isActive: boolean;

    @Column('int', {default: 0})
    tokenVersion: number;

    static async createUser(name: string, email: string, password: string) {
        const user = new User();
        user.name = name;
        user.email = email;
        user.password = hashPassword(password);
        user.lastLogin = new Date().toUTCString();
        user.isActive = true;
        return await user.save();
    }

    serialize() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
        };
    }
}
