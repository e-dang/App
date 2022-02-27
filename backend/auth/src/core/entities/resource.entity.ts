import {Expose, Transform} from "class-transformer";
import {CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

export class Resource {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Transform(({value}: {value: Date}) => value.toISOString())
  @CreateDateColumn({type: "timestamptz"})
  createdAt: Date;

  @Transform(({value}: {value: Date}) => value.toISOString())
  @UpdateDateColumn({type: "timestamptz"})
  updatedAt: Date;

  @Transform(({value}: {value: Date | null}) => (value === null ? null : value.toISOString()))
  @Expose({groups: ["admin"]})
  @DeleteDateColumn({type: "timestamptz"})
  deletedAt: Date;
}
