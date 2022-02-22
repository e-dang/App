import {AuthenticationMiddleware} from "@core/middleware/authentication.middleware";
import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {PasswordHasherModule} from "@password-hasher/password-hasher.module";
import {UsersModule} from "@users/users.module";
import {EmailerModule} from "@emailer/emailer.module";
import {PasswordResetModule} from "@password-reset/password-reset.module";
import {JwtModule} from "@jwt/jwt.module";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";

@Module({
  imports: [UsersModule, PasswordHasherModule, EmailerModule, JwtModule, PasswordResetModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes("*/auth/password/change", "*/auth/signout");
  }
}
