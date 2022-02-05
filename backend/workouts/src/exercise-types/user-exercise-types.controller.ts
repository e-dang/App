import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  SerializeOptions,
} from "@nestjs/common";
import {UserScopedParamDto} from "@core/dto/user-scoped.dto";
import {OwnerGuard} from "@core/guards/owner.guard";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {ExerciseTypesService} from "./user-exercise-types.service";
import {CreateExerciseTypeUserDto, UpdateExerciseTypeUserDto} from "./dto/exercise-type-body.dto";
import {UserExerciseTypeParamDto} from "./dto/exercise-type-params.dto";

@Controller("types/:ownerId/exercises")
@UseGuards(OwnerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["user"],
})
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Post()
  create(@Param() params: UserScopedParamDto, @Body() createExerciseTypeDto: CreateExerciseTypeUserDto) {
    return this.exerciseTypesService.create(params, createExerciseTypeDto);
  }

  @Get()
  findAll(@Param() params: UserScopedParamDto) {
    return this.exerciseTypesService.findAll(params);
  }

  @Get(":exerciseId")
  findOne(@Param() params: UserExerciseTypeParamDto) {
    return this.exerciseTypesService.findOne(params);
  }

  @Patch(":exerciseId")
  update(@Param() params: UserExerciseTypeParamDto, @Body() updateExerciseTypeDto: UpdateExerciseTypeUserDto) {
    return this.exerciseTypesService.update(params, updateExerciseTypeDto);
  }

  @Delete(":exerciseId")
  remove(@Param() params: UserExerciseTypeParamDto) {
    return this.exerciseTypesService.remove(params);
  }
}
