import {Injectable, NestMiddleware, UnauthorizedException} from "@nestjs/common";
import {NextFunction, Request, Response} from "express";
import {JwtService} from "@jwt/jwt.service";
import {UsersService} from "@users/users.service";
import {AuthenticatedRequest} from "../types";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.parseAccessToken(req);

    try {
      const payload = await this.jwtService.verifyAccessToken(token);
      const user = await this.usersService.findOne({id: payload.userId}); // get user here to ensure that user has not been deleted
      (req as AuthenticatedRequest).user = user;
    } catch (err) {
      throw new UnauthorizedException();
    }

    next();
  }

  private parseAccessToken(req: Request) {
    const authHeader = req.get("authorization");
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [specifier, token] = authHeader.split(" ");
    if (specifier.toLowerCase() !== "token") {
      throw new UnauthorizedException();
    }

    return token;
  }
}
