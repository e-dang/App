import {Module} from "@nestjs/common";
import {ConfigModule} from "@src/config/config.module";
import {PasswordResetConfig} from "@src/config/password-reset.config";
import {PasswordResetService} from "./password-reset.service";

@Module({
  imports: [ConfigModule.forFeature(PasswordResetConfig)],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
