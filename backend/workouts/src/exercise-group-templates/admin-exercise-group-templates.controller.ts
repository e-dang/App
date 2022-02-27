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
import {Roles} from "@core/decorators";
import {TransformResponseInterceptor} from "@core/interceptors";
import {AdminExerciseGroupTemplatesService} from "./admin-exercise-group-templates.service";
import {CreateExerciseGroupTemplateDto, UpdateExerciseGroupTemplateDto} from "./dto/exercise-group-template-body.dto";
import {ExerciseGroupTemplateParamDto} from "./dto/exercise-group-template-params.dto";

@Controller("templates/exercise-groups")
@Roles("admin")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["admin"],
})
export class AdminExerciseGroupTemplatesController {
  constructor(private readonly exerciseGroupTemplatesService: AdminExerciseGroupTemplatesService) {}

  @Post()
  create(@Body() createExerciseGroupTemplateDto: CreateExerciseGroupTemplateDto) {
    return this.exerciseGroupTemplatesService.create(createExerciseGroupTemplateDto);
  }

  @Get()
  findAll() {
    return this.exerciseGroupTemplatesService.findAll();
  }

  @Get(":exerciseGroupId")
  findOne(@Param() {exerciseGroupId}: ExerciseGroupTemplateParamDto) {
    return this.exerciseGroupTemplatesService.findOne(exerciseGroupId);
  }

  @Patch(":exerciseGroupId")
  update(
    @Param() {exerciseGroupId}: ExerciseGroupTemplateParamDto,
    @Body() updateExerciseGroupTemplateDto: UpdateExerciseGroupTemplateDto,
  ) {
    return this.exerciseGroupTemplatesService.update(exerciseGroupId, updateExerciseGroupTemplateDto);
  }

  @Delete(":exerciseGroupId")
  remove(@Param() {exerciseGroupId}: ExerciseGroupTemplateParamDto) {
    return this.exerciseGroupTemplatesService.remove(exerciseGroupId);
  }
}
