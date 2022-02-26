import {dateToSeconds} from "@core/utils";
import {Injectable} from "@nestjs/common";
import {User} from "@users";
import crypto from "crypto";
import base32 from "hi-base32";
import {ExpiredTokenException, InvalidTokenException} from "@core/exceptions";
import {PasswordResetConfig} from "./password-reset.config";

@Injectable()
export class PasswordResetService {
  private readonly separator = "-";

  constructor(private readonly config: PasswordResetConfig) {}

  createToken(user: User) {
    const b32TimeStamp = this.base32EncodeDate(new Date());
    const hash = this.generateTokenHash(user, b32TimeStamp);
    return this.joinToken(b32TimeStamp, hash);
  }

  verifyToken(user: User, token: string) {
    const [b32TimeStamp, hash] = this.splitToken(token);
    const timeStamp = this.base32DecodeDate(b32TimeStamp);
    const currentTime = dateToSeconds(new Date());

    if (currentTime - timeStamp > this.config.passwordResetTokenExp) {
      throw new ExpiredTokenException();
    } else if (hash !== this.generateTokenHash(user, b32TimeStamp)) {
      throw new InvalidTokenException();
    }

    return true;
  }

  private generateTokenHash(user: User, timestamp: string) {
    const lastLoginSeconds = dateToSeconds(user.lastLogin);
    const data = `${user.id}${user.password}${lastLoginSeconds}${timestamp}`;
    return crypto
      .createHmac(this.config.passwordResetTokenAlg, this.config.passwordResetTokenSecret)
      .update(data)
      .digest("hex");
  }

  private splitToken(token: string) {
    return token.split(this.separator);
  }

  private joinToken(timestamp: string, hash: string) {
    return `${timestamp}${this.separator}${hash}`;
  }

  private base32EncodeDate(date: Date) {
    return base32.encode(dateToSeconds(date).toString());
  }

  private base32DecodeDate(date: string) {
    return parseInt(base32.decode(date), 10);
  }
}
