import {config} from "@config";
import {User} from "@entities";
import nodemailer from "nodemailer";
import handlebars from "handlebars";
import {readFileSync} from "fs";
import {join} from "path";

function createTransport() {
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
}

const transporter = createTransport();

export async function sendPasswordResetEmail(user: User, token: string) {
  const html = readFileSync(join(__dirname, "templates", "resetPassword.html")).toString();
  const template = handlebars.compile(html);
  await transporter.sendMail({
    from: '"Test App" <test@demo.com>',
    to: user.email,
    subject: "Password Reset Request",
    html: template({url: `${config.client}/password/reset/${user.id}/${token}`}),
  });
}
