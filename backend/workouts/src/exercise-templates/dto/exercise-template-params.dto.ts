import {IsUUID} from "class-validator";
import {UserScopedParamDto} from "@core/dto";
import {IntersectionType} from "@nestjs/mapped-types";

export class ExerciseTemplateParamDto {
  @IsUUID()
  exerciseId: string;
}

export class UserExerciseTemplateParamDto extends IntersectionType(UserScopedParamDto, ExerciseTemplateParamDto) {}
