import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PasswordHasherModule} from "@password-hasher/password-hasher.module";
import {JwtModule} from "@jwt/jwt.module";
import {AuthenticationMiddleware} from "@core/middleware/authentication.middleware";
import {UsersService} from "./users.service";
import {UsersController} from "./users.controller";
import {User} from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User]), PasswordHasherModule, JwtModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes("*/user");
  }
}
