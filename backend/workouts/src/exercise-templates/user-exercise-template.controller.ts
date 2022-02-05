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
import {ExerciseTemplateService} from "./user-exercise-template.service";
import {UserExerciseTemplateParamDto} from "./dto/exercise-template-params.dto";
import {CreateExerciseTemplateDto, UpdateExerciseTemplateDto} from "./dto/exercise-template-body.dto";

@Controller("templates/:ownerId/exercises")
@UseGuards(OwnerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["user"],
})
export class ExerciseTemplateController {
  constructor(private readonly exerciseTemplateService: ExerciseTemplateService) {}

  @Post()
  create(@Param() params: UserScopedParamDto, @Body() createExerciseTemplateDto: CreateExerciseTemplateDto) {
    return this.exerciseTemplateService.create(params, createExerciseTemplateDto);
  }

  @Get()
  findAll(@Param() params: UserScopedParamDto) {
    return this.exerciseTemplateService.findAll(params);
  }

  @Get(":exerciseId")
  findOne(@Param() params: UserExerciseTemplateParamDto) {
    return this.exerciseTemplateService.findOne(params);
  }

  @Patch(":exerciseId")
  update(@Param() params: UserExerciseTemplateParamDto, @Body() updateExerciseTemplateDto: UpdateExerciseTemplateDto) {
    return this.exerciseTemplateService.update(params, updateExerciseTemplateDto);
  }

  @Delete(":exerciseId")
  remove(@Param() params: UserExerciseTemplateParamDto) {
    return this.exerciseTemplateService.remove(params);
  }
}
