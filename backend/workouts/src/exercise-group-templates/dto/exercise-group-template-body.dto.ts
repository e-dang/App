import {MAX_INT16} from "@core/constants";
import {CreateExerciseTemplateDto, UpdateExerciseTemplateDto} from "@exercise-templates/dto/exercise-template-body.dto";
import {OmitType, PartialType} from "@nestjs/mapped-types";
import {Type} from "class-transformer";
import {IsUUID, Max, Min, ValidateNested} from "class-validator";

const exerciseGroupTemplateDtoFactory = <T>(type: {new (): T}) => {
  class BaseExerciseGroupTemplateDto {
    @Min(0)
    @Max(MAX_INT16)
    index: number;

    @IsUUID()
    workoutId: string;

    @ValidateNested({each: true})
    @Type(() => type)
    exercises: T[];
  }

  return BaseExerciseGroupTemplateDto as new () => {
    [key in keyof BaseExerciseGroupTemplateDto]: BaseExerciseGroupTemplateDto[key];
  };
};

export class CreateExerciseGroupTemplateDto extends exerciseGroupTemplateDtoFactory(
  OmitType(CreateExerciseTemplateDto, ["exerciseGroupId"] as const),
) {}

export class UpdateExerciseGroupTemplateDto extends PartialType(
  exerciseGroupTemplateDtoFactory(OmitType(UpdateExerciseTemplateDto, ["exerciseGroupId"] as const)),
) {}
