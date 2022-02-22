import {PG_INT_MIN_VALUE} from "@core/constants";
import {Resource} from "@core/entities/resource.entity";
import {Role} from "@core/types";
import {Exclude} from "class-transformer";
import {Column, Entity, Index} from "typeorm";

@Entity("users")
export class User extends Resource {
  @Column("varchar", {length: 255, nullable: false})
  name: string;

  @Index()
  @Column("varchar", {length: 255, unique: true, nullable: false})
  email: string;

  @Exclude()
  @Column({nullable: false})
  password: string;

  @Exclude()
  @Column("timestamptz", {nullable: false})
  lastLogin: Date;

  @Exclude()
  @Column("int", {default: PG_INT_MIN_VALUE})
  tokenVersion: number;

  @Exclude()
  @Column({type: "enum", enum: Role, nullable: false, default: Role.User})
  role: Role;
}
