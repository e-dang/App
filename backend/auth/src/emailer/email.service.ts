import {Inject, Injectable} from "@nestjs/common";
import {User} from "@users";
import {readFileSync} from "fs";
import nodemailer from "nodemailer";
import {join} from "path";
import handlebars from "handlebars";
import {TRANSPORTER} from "./constants";
import {EmailConfig} from "./email.config";

@Injectable()
export class EmailService {
  constructor(
    @Inject(TRANSPORTER) private readonly transport: ReturnType<typeof nodemailer.createTransport>,
    private readonly config: EmailConfig,
  ) {}

  async sendPasswordResetEmail(user: User, token: string) {
    const html = readFileSync(join(__dirname, "templates", "reset-password.html")).toString();
    const template = handlebars.compile(html);
    await this.transport.sendMail({
      from: '"Test App" <test@demo.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: template({url: `${this.config.passwordResetRedirectUrl}/password/reset/${user.id}/${token}`}),
    });
  }
}
