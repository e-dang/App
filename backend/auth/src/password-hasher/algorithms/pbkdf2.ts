import {Injectable} from "@nestjs/common";
import {PasswordHasherAlgorithms} from "@password-hasher/constants";
import {PasswordHasherConfig} from "@password-hasher/password-hasher.config";
import {randomBytes, pbkdf2Sync} from "crypto";
import {Algorithm} from "./algorithm";

@Injectable()
export class PBKDF2 extends Algorithm {
  constructor(private readonly config: PasswordHasherConfig) {
    super();
  }

  private readonly keylen = 64;

  private readonly digest = "sha512";

  hashPassword(password: string) {
    const salt = randomBytes(this.config.passwordSaltLength).toString("hex");
    const hash = pbkdf2Sync(password, salt, this.config.passwordIterations, this.keylen, this.digest).toString("hex");
    return this.joinPassword(this.name, this.config.passwordIterations, salt, hash);
  }

  passwordIsValid(password: string, storedPassword: string) {
    const [, iterations, salt, hashedPassword] = this.parsePassword(storedPassword);
    const hashVerify = pbkdf2Sync(password, salt, parseInt(iterations, 10), this.keylen, this.digest).toString("hex");
    return hashedPassword === hashVerify;
  }

  get name() {
    return PasswordHasherAlgorithms.PBKDF2;
  }
}
