import {MAX_INT16} from "@core/constants";
import {Unit} from "@exercise-templates/entities/exercise-template.entity";
import {PartialType} from "@nestjs/mapped-types";
import {IsEnum, IsUUID, Max, Min} from "class-validator";

export class CreateExerciseTemplateDto {
  @Min(0)
  @Max(MAX_INT16)
  index: number;

  @Min(0)
  @Max(MAX_INT16)
  targetReps: number;

  @Min(0)
  @Max(MAX_INT16)
  targetSets: number;

  @Min(0)
  @Max(MAX_INT16)
  targetWeight: number;

  @IsEnum(Unit)
  unit: Unit;

  @IsUUID()
  typeId: string;

  @IsUUID()
  exerciseGroupId: string;
}

export class UpdateExerciseTemplateDto extends PartialType(CreateExerciseTemplateDto) {}
