import {BadRequestException, Injectable} from "@nestjs/common";
import {User} from "@src/users/entities/user.entity";
import {UsersService} from "@users/users.service";
import {PasswordHasherService} from "@password-hasher/password-hasher.service";
import {EmailService} from "@emailer/email.service";
import {JwtService} from "@jwt/jwt.service";
import {PasswordResetService} from "@password-reset/password-reset.service";
import {InvalidTokenException} from "@core/exceptions/invalid-token";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {ResetPasswordConfirmDto} from "./dto/reset-password-confirm.dto";
import {ResetPasswordDto} from "./dto/reset-password.dto";
import {SignInDto} from "./dto/signin.dto";
import {SignUpDto} from "./dto/signup.dto";
import {SignInException} from "./exceptions/signin.exception";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly passwordResetTokenService: PasswordResetService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(payload: SignUpDto) {
    const user = await this.usersService.create(payload);
    return this.jwtService.createJwt(user);
  }

  async signIn({email, password}: SignInDto) {
    const user = await this.usersService.findOne({email});
    if (!user) {
      throw new SignInException();
    }

    if (!this.passwordHasherService.passwordIsValid(password, user.password)) {
      throw new SignInException();
    }

    const [, tokens] = await Promise.all([this.usersService.updateLastLogin(user.id), this.jwtService.createJwt(user)]);
    return tokens;
  }

  async signOut(user: User) {
    await this.usersService.incrementTokenVersion({id: user.id});
  }

  async resetPassword({email}: ResetPasswordDto) {
    const user = await this.usersService.findOne({email});
    if (!user) {
      return; // Always return saying it worked so you dont expose User emails
    }

    const token = this.passwordResetTokenService.createToken(user);
    await this.emailService.sendPasswordResetEmail(user, token);
  }

  async resetPasswordConfirm({userId, token, newPassword}: ResetPasswordConfirmDto) {
    const user = await this.usersService.findOne({id: userId});
    if (!user) {
      // send back token error since letting the sender know that a user with a certain id doesn't exist
      // would leak user id info
      throw new InvalidTokenException();
    }

    this.passwordResetTokenService.verifyToken(user, token);
    await this.usersService.updatePassword(user.id, newPassword);
  }

  async changePassword(user: User, {oldPassword, newPassword}: ChangePasswordDto) {
    if (!this.passwordHasherService.passwordIsValid(oldPassword, user.password)) {
      throw new BadRequestException("Password is incorrect");
    }
    await this.usersService.updatePassword(user.id, newPassword);
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findOneOrFail({id: payload.userId});

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new InvalidTokenException();
    }

    return this.jwtService.createJwt(user);
  }
}
