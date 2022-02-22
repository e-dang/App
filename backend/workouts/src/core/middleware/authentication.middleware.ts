import {Injectable, NestMiddleware, UnauthorizedException} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Configuration} from "@src/config";
import {NextFunction, Request, Response} from "express";
import {jwtVerify} from "jose";
import {getRepository} from "typeorm";
import {User} from "../entities/user.entity";
import {AccessTokenPayload, AuthenticatedRequest} from "../types";

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService<Configuration>) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.parseAccessToken(req);

    let payload: AccessTokenPayload;
    try {
      const decoded = await jwtVerify(token, await this.configService.get("accessTokenPublicKey"));
      payload = decoded.payload as AccessTokenPayload;

      const repo = getRepository(User);
      let user = await repo.findOne(payload.userId);
      if (!user) {
        // If user not found, but we have verified that the JWT is valid, then create new user.
        // This might only be temprorary until event architecture is in place
        user = repo.create({id: payload.userId});
        await repo.save(user);
      }
    } catch (err) {
      throw new UnauthorizedException();
    }

    (req as AuthenticatedRequest).accessToken = payload;
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
