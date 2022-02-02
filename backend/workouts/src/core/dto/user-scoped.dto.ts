import {IsUUID} from "class-validator";

export class UserScopedParamDto {
  @IsUUID()
  ownerId: string;
}
