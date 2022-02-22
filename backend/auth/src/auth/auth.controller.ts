import {Cookies} from "@core/decoractors/cookies";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {AuthenticatedRequest} from "@core/types";
import {Controller, Post, Body, UseInterceptors, Res, Req, HttpCode, HttpStatus} from "@nestjs/common";
import {Response} from "express";
import {AuthService} from "./auth.service";
import {ChangePasswordDto} from "./dto/change-password.dto";
import {ResetPasswordConfirmDto} from "./dto/reset-password-confirm.dto";
import {ResetPasswordDto} from "./dto/reset-password.dto";
import {SignInDto} from "./dto/signin.dto";
import {SignUpDto} from "./dto/signup.dto";
import {REFRESH_TOKEN_COOKIE} from "./constants";

@Controller("auth")
@UseInterceptors(TransformResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signUp(@Body() payload: SignUpDto, @Res({passthrough: true}) res: Response) {
    const {accessToken, refreshToken} = await this.authService.signUp(payload);
    this.setRefreshTokenCookie(res, refreshToken);
    return {accessToken};
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() payload: SignInDto, @Res({passthrough: true}) res: Response) {
    const {accessToken, refreshToken} = await this.authService.signIn(payload);
    this.setRefreshTokenCookie(res, refreshToken);
    return {accessToken};
  }

  @Post("signout")
  @HttpCode(HttpStatus.OK)
  signOut(@Req() req: AuthenticatedRequest) {
    return this.authService.signOut(req.user);
  }

  @Post("password/reset")
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authService.resetPassword(payload);
  }

  @Post("password/reset/confirm")
  @HttpCode(HttpStatus.OK)
  resetPasswordConfirm(@Body() payload: ResetPasswordConfirmDto) {
    return this.authService.resetPasswordConfirm(payload);
  }

  @Post("password/change")
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() payload: ChangePasswordDto, @Req() req: AuthenticatedRequest) {
    return this.authService.changePassword(req.user, payload);
  }

  @Post("token/refresh")
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(
    @Cookies(REFRESH_TOKEN_COOKIE.description) refreshToken: string,
    @Res({passthrough: true}) res: Response,
  ) {
    const {accessToken, refreshToken: newRefreshToken} = await this.authService.refreshAccessToken(refreshToken);
    this.setRefreshTokenCookie(res, newRefreshToken);
    return {accessToken};
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_TOKEN_COOKIE.description, refreshToken, {httpOnly: true});
  }
}
