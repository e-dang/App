// import config from "@config";
import {EmailService} from "@emailer/email.service";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@src/config/config.module";
import {EmailConfig} from "@src/config/email.config";
import nodemailer from "nodemailer";
import {TRANSPORTER} from "./constants";

@Module({
  imports: [ConfigModule.forFeature(EmailConfig)],
  providers: [
    EmailService,
    {
      provide: TRANSPORTER,
      useFactory: (config: EmailConfig) => {
        let auth = {
          user: config.emailUser,
          pass: config.emailPassword,
        };

        if (auth.user === undefined || auth.pass === undefined) {
          auth = undefined;
        }

        return nodemailer.createTransport({
          host: config.emailHost,
          port: config.emailPort,
          secure: config.emailPort === 465, // true for 465, false for other ports
          auth,
        });
      },
      inject: [EmailConfig],
    },
  ],
  exports: [EmailService],
})
export class EmailerModule {}
