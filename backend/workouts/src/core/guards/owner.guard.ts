import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {AuthenticatedRequest} from "../types";

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.params.ownerId === req.accessToken.userId || req.accessToken.role === "admin";
  }
}
