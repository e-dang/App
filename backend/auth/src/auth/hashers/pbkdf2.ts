import {randomBytes, pbkdf2Sync} from "crypto";
import {Hasher, parsePassword} from "./hasher";

function joinPassword(alg: string, iterations: number, salt: string, hashedPassword: string) {
  return `${alg}$${iterations}$${salt}$${hashedPassword}`;
}

export class PBKDF2 implements Hasher {
  static readonly alg = "pbkdf2";

  private readonly iterations = 1000;

  private readonly keylen = 64;

  private readonly digest = "sha512";

  private readonly saltLength = 32;

  hashPassword(password: string) {
    const salt = randomBytes(this.saltLength).toString("hex");
    const hash = pbkdf2Sync(password, salt, this.iterations, this.keylen, this.digest).toString("hex");
    return joinPassword(PBKDF2.alg, this.iterations, salt, hash);
  }

  passwordIsValid(password: string, storedPassword: string) {
    const [_, iterations, salt, hashedPassword] = parsePassword(storedPassword);
    const hashVerify = pbkdf2Sync(password, salt, parseInt(iterations, 10), this.keylen, this.digest).toString("hex");
    return hashedPassword === hashVerify;
  }
}
