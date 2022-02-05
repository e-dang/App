import {IsUUID} from "class-validator";
import {UserScopedParamDto} from "@core/dto/user-scoped.dto";
import {IntersectionType} from "@nestjs/mapped-types";

export class ExerciseTypeParamDto {
  @IsUUID()
  exerciseId: string;
}

export class UserExerciseTypeParamDto extends IntersectionType(UserScopedParamDto, ExerciseTypeParamDto) {}
