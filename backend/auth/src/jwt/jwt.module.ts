import {Module} from "@nestjs/common";
import {ConfigModule} from "@src/config/config.module";
import {JwtConfig} from "@src/config/jwt.config";
import {JwtService} from "./jwt.service";

@Module({
  imports: [ConfigModule.forFeature(JwtConfig)],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
