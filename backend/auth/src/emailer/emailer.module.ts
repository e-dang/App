import {Module} from "@nestjs/common";
import nodemailer from "nodemailer";
import {EmailConfig} from "./email.config";
import {EmailService} from "./email.service";
import {TRANSPORTER} from "./constants";

@Module({
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
