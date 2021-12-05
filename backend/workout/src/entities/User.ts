import {Entity, PrimaryColumn, BaseEntity} from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
    @PrimaryColumn('uuid')
    id: string;
}
