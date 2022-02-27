import {IsUUID} from "class-validator";
import {UserScopedParamDto} from "@core/dto";
import {IntersectionType} from "@nestjs/mapped-types";

export class ExerciseGroupTemplateParamDto {
  @IsUUID()
  exerciseGroupId: string;
}

export class UserExerciseGroupTemplateParamDto extends IntersectionType(
  UserScopedParamDto,
  ExerciseGroupTemplateParamDto,
) {}
