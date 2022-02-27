import {UserScopedParamDto} from "@core/dto";
import {IntersectionType} from "@nestjs/mapped-types";
import {IsUUID} from "class-validator";

export class WorkoutTemplateParamDto {
  @IsUUID()
  workoutId: string;
}

export class UserWorkoutTemplateParamDto extends IntersectionType(UserScopedParamDto, WorkoutTemplateParamDto) {}
