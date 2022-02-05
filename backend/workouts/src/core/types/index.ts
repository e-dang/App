import {JWTPayload} from "jose";
import {Request} from "express";

export type Role = "user" | "admin";

export interface AccessTokenPayload extends JWTPayload {
  userId: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  accessToken: AccessTokenPayload;
}

export interface Response<T> {
  data: T;
}
