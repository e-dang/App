import {User} from "@entities";
import {ExpiredTokenError, InvalidTokenError} from "@errors";
import crypto from "crypto";
import {config} from "@config";
import base32 from "hi-base32";

export function dateToSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function createHashData(user: User, timestamp: string) {
  const lastLoginSeconds = dateToSeconds(user.lastLogin);
  return `${user.id}${user.password}${lastLoginSeconds}${timestamp}`;
}

function generateTokenHash(user: User, timestamp: string) {
  const data = createHashData(user, timestamp);
  return crypto.createHmac(config.passwordResetTokenAlg, config.passwordResetTokenSecret).update(data).digest("hex");
}

function joinToken(timestamp: string, hash: string) {
  return `${timestamp}-${hash}`;
}

function splitToken(token: string) {
  return token.split("-");
}

export function verifyPasswordResetToken(user: User, token: string) {
  const [b36TimeStamp, hash] = splitToken(token);
  const timeStamp = parseInt(base32.decode(b36TimeStamp), 10);
  const currentTime = dateToSeconds(new Date());

  if (currentTime - timeStamp > config.passwordResetTokenExp) {
    throw new ExpiredTokenError("body", "token");
  } else if (hash !== generateTokenHash(user, b36TimeStamp)) {
    throw new InvalidTokenError("body", "token");
  }

  return true;
}

export function createPasswordResetToken(user: User) {
  const b36CurrentTime = base32.encode(dateToSeconds(new Date()).toString());
  const hash = generateTokenHash(user, b36CurrentTime);
  return joinToken(b36CurrentTime, hash);
}
