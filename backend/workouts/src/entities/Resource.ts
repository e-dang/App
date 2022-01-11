import {CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity} from "typeorm";

export interface ResourceDetail {
  id: string;
  createdAt: string;
  lastUpdatedAt: string;
}

export abstract class Resource extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({type: "timestamptz"})
  createdAt: Date;

  @UpdateDateColumn({type: "timestamptz"})
  lastUpdatedAt: Date;

  @DeleteDateColumn({type: "timestamptz"})
  deletedAt: Date;
}
