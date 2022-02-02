import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import {UserScopedParamDto} from "@core/dto/user-scoped.dto";
import {OwnerGuard} from "@core/guards/owner.guard";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {ExerciseGroupTemplatesService} from "./user-exercise-group-templates.service";
import {UserExerciseGroupTemplateParamDto} from "./dto/exercise-group-template-params.dto";
import {CreateExerciseGroupTemplateDto, UpdateExerciseGroupTemplateDto} from "./dto/exercise-group-template-body.dto";

@Controller("templates/:ownerId/exercise-groups")
@UseGuards(OwnerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["user"],
})
export class ExerciseGroupTemplatesController {
  constructor(private readonly exerciseGroupTemplatesService: ExerciseGroupTemplatesService) {}

  @Post()
  create(@Param() params: UserScopedParamDto, @Body() createExerciseGroupTemplateDto: CreateExerciseGroupTemplateDto) {
    return this.exerciseGroupTemplatesService.create(params, createExerciseGroupTemplateDto);
  }

  @Get()
  findAll(@Param() params: UserScopedParamDto) {
    return this.exerciseGroupTemplatesService.findAll(params);
  }

  @Get(":exerciseGroupId")
  findOne(@Param() params: UserExerciseGroupTemplateParamDto) {
    return this.exerciseGroupTemplatesService.findOne(params);
  }

  @Patch(":exerciseGroupId")
  update(
    @Param() params: UserExerciseGroupTemplateParamDto,
    @Body() updateExerciseGroupTemplateDto: UpdateExerciseGroupTemplateDto,
  ) {
    return this.exerciseGroupTemplatesService.update(params, updateExerciseGroupTemplateDto);
  }

  @Delete(":exerciseGroupId")
  remove(@Param() params: UserExerciseGroupTemplateParamDto) {
    return this.exerciseGroupTemplatesService.remove(params);
  }
}
