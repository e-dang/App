import {Injectable, CanActivate, ExecutionContext} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {AuthenticatedRequest, Role} from "../types";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Role[]>("roles", context.getClass());
    if (!roles) {
      return true;
    }
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return this.matchRoles(roles, req.accessToken.role);
  }

  matchRoles(roles: Role[], role: Role) {
    if (role === "admin") {
      return true;
    }

    return roles.includes(role);
  }
}
