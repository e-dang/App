import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from "@nestjs/common";
import {Roles} from "@core/decorators/roles";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {ExerciseTypesAdminService} from "./admin-exercise-types.service";
import {CreateExerciseTypeAdminDto, UpdateExerciseTypeAdminDto} from "./dto/exercise-type-body.dto";
import {ExerciseTypeParamDto} from "./dto/exercise-type-params.dto";

@Controller("types/exercises")
@Roles("admin")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["admin"],
})
export class ExerciseTypesAdminController {
  constructor(private readonly exerciseTypesService: ExerciseTypesAdminService) {}

  @Post()
  create(@Body() createExerciseTypeDto: CreateExerciseTypeAdminDto) {
    return this.exerciseTypesService.create(createExerciseTypeDto);
  }

  @Get()
  findAll() {
    return this.exerciseTypesService.findAll();
  }

  @Get(":exerciseId")
  findOne(@Param() {exerciseId}: ExerciseTypeParamDto) {
    return this.exerciseTypesService.findOne(exerciseId);
  }

  @Patch(":exerciseId")
  update(@Param() {exerciseId}: ExerciseTypeParamDto, @Body() updateExerciseTypeDto: UpdateExerciseTypeAdminDto) {
    return this.exerciseTypesService.update(exerciseId, updateExerciseTypeDto);
  }

  @Delete(":exerciseId")
  remove(@Param() {exerciseId}: ExerciseTypeParamDto) {
    return this.exerciseTypesService.remove(exerciseId);
  }
}
