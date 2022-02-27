import {Injectable} from "@nestjs/common";
import {randomBytes, pbkdf2Sync} from "crypto";
import {PasswordHasherAlgorithms} from "../constants";
import {PasswordHasherConfig} from "../password-hasher.config";
import {Algorithm} from "./algorithm";

@Injectable()
export class PBKDF2 extends Algorithm {
  constructor(private readonly config: PasswordHasherConfig) {
    super();
  }

  hashPassword(password: string) {
    const salt = randomBytes(this.config.pbkdf2SaltLength).toString("hex");
    const hash = pbkdf2Sync(
      password,
      salt,
      this.config.pbkdf2Iterations,
      this.config.pbkdf2keylen,
      this.config.pbkdf2Digest,
    ).toString("hex");
    return this.joinPassword(
      this.name,
      this.config.pbkdf2Iterations,
      salt,
      hash,
      this.config.pbkdf2keylen,
      this.config.pbkdf2Digest,
    );
  }

  passwordIsValid(password: string, storedPassword: string) {
    const [, iterations, salt, hashedPassword, keyLen, digest] = this.parsePassword(storedPassword);
    const hashVerify = pbkdf2Sync(password, salt, parseInt(iterations, 10), parseInt(keyLen, 10), digest).toString(
      "hex",
    );
    return hashedPassword === hashVerify;
  }

  get name() {
    return PasswordHasherAlgorithms.PBKDF2;
  }
}
