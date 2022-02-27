import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  SerializeOptions,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import {Roles} from "@core/decorators";
import {TransformResponseInterceptor} from "@core/interceptors";
import {ExerciseTemplateAdminService} from "./admin-exercise-template.service";
import {CreateExerciseTemplateDto, UpdateExerciseTemplateDto} from "./dto/exercise-template-body.dto";
import {ExerciseTemplateParamDto} from "./dto/exercise-template-params.dto";

@Controller("templates/exercises")
@Roles("admin")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["admin"],
})
export class ExerciseTemplateAdminController {
  constructor(private readonly exerciseTemplateService: ExerciseTemplateAdminService) {}

  @Post()
  create(@Body() createExerciseTemplateDto: CreateExerciseTemplateDto) {
    return this.exerciseTemplateService.create(createExerciseTemplateDto);
  }

  @Get()
  findAll() {
    return this.exerciseTemplateService.findAll();
  }

  @Get(":exerciseId")
  findOne(@Param() {exerciseId}: ExerciseTemplateParamDto) {
    return this.exerciseTemplateService.findOne(exerciseId);
  }

  @Patch(":exerciseId")
  update(
    @Param() {exerciseId}: ExerciseTemplateParamDto,
    @Body() updateExerciseTemplateDto: UpdateExerciseTemplateDto,
  ) {
    return this.exerciseTemplateService.update(exerciseId, updateExerciseTemplateDto);
  }

  @Delete(":exerciseId")
  remove(@Param() {exerciseId}: ExerciseTemplateParamDto) {
    return this.exerciseTemplateService.remove(exerciseId);
  }
}
