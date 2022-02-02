import {
  CreateExerciseGroupTemplateDto,
  UpdateExerciseGroupTemplateDto,
} from "@exercise-group-templates/dto/exercise-group-template-body.dto";
import {OmitType, PartialType} from "@nestjs/mapped-types";
import {Type} from "class-transformer";
import {IsOptional, IsString, IsUUID, MinLength, ValidateNested} from "class-validator";

const workoutTemplateDtoFactory = <T>(type: {new (): T}) => {
  class BaseWorkoutTemplateDto {
    @MinLength(1)
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    notes: string;

    @IsUUID()
    ownerId: string;

    @ValidateNested({each: true})
    @Type(() => type)
    exerciseGroups: T[];
  }

  return BaseWorkoutTemplateDto as new () => {
    [key in keyof BaseWorkoutTemplateDto]: BaseWorkoutTemplateDto[key];
  };
};

export class CreateWorkoutTemplateAdminDto extends workoutTemplateDtoFactory(
  OmitType(CreateExerciseGroupTemplateDto, ["workoutId"] as const),
) {}

export class CreateWorkoutTemplateUserDto extends OmitType(CreateWorkoutTemplateAdminDto, ["ownerId"] as const) {}

export class UpdateWorkoutTemplateAdminDto extends PartialType(
  workoutTemplateDtoFactory(OmitType(UpdateExerciseGroupTemplateDto, ["workoutId"] as const)),
) {}

export class UpdateWorkoutTemplateUserDto extends OmitType(UpdateWorkoutTemplateAdminDto, ["ownerId"] as const) {}
