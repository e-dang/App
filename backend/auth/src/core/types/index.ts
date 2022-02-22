import {User as EntityUser} from "@users/entities/user.entity";
import {Request} from "express";

export enum Role {
  User = "user",
  Admin = "admin",
}

export interface AuthenticatedRequest extends Request {
  user: EntityUser;
}

export interface Response<T> {
  data: T;
}
