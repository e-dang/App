import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  Req,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {TransformResponseInterceptor} from "@core/interceptors";
import {AuthenticatedRequest} from "@core/types";
import {UsersService} from "./users.service";
import {UpdateUserDto} from "./dto/update-user.dto";

@Controller("user")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  currentUser(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  @Patch()
  update(@Req() req: AuthenticatedRequest, @Body() payload: UpdateUserDto) {
    return this.usersService.update(req.user, payload);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: AuthenticatedRequest) {
    return this.usersService.remove(req.user);
  }
}
