import {Role} from "@core/types";
import {JWTPayload} from "jose";

interface TokenPayload extends JWTPayload {
  userId: string;
}

export interface AccessTokenPayload extends TokenPayload {
  role: Role;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenVersion: number;
}
