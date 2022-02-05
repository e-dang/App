import {IsString, IsUUID, MinLength} from "class-validator";
import {PartialType} from "@nestjs/mapped-types";

export class CreateExerciseTypeUserDto {
  @MinLength(1)
  @IsString()
  name: string;
}

export class CreateExerciseTypeAdminDto extends CreateExerciseTypeUserDto {
  @IsUUID()
  ownerId: string;
}

export class UpdateExerciseTypeUserDto extends PartialType(CreateExerciseTypeUserDto) {}

export class UpdateExerciseTypeAdminDto extends PartialType(CreateExerciseTypeAdminDto) {}
