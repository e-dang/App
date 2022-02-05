import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from "@nestjs/common";
import {UserScopedParamDto} from "@core/dto/user-scoped.dto";
import {OwnerGuard} from "@core/guards/owner.guard";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {UserWorkoutTemplatesService} from "./user-workout-templates.service";
import {UserWorkoutTemplateParamDto} from "./dto/workout-template-params.dto";
import {WorkoutTemplate} from "./entities/workout-template.entity";
import {CreateWorkoutTemplateUserDto, UpdateWorkoutTemplateUserDto} from "./dto/workout-template-body.dto";

@Controller("templates/:ownerId/workouts")
@UseGuards(OwnerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
export class UserWorkoutTemplatesController {
  constructor(private readonly workoutTemplatesService: UserWorkoutTemplatesService) {}

  @SerializeOptions({
    groups: ["user", "detail"],
  })
  @Post()
  create(@Param() params: UserScopedParamDto, @Body() createWorkoutTemplateDto: CreateWorkoutTemplateUserDto) {
    return this.workoutTemplatesService.create(params, createWorkoutTemplateDto);
  }

  @SerializeOptions({
    groups: ["user"],
  })
  @Get()
  findAll(@Param() params: UserScopedParamDto): Promise<WorkoutTemplate[]> {
    return this.workoutTemplatesService.findAll(params);
  }

  @SerializeOptions({
    groups: ["user", "detail"],
  })
  @Get(":workoutId")
  findOne(@Param() params: UserWorkoutTemplateParamDto) {
    return this.workoutTemplatesService.findOne(params);
  }

  @SerializeOptions({
    groups: ["user", "detail"],
  })
  @Patch(":workoutId")
  update(@Param() params: UserWorkoutTemplateParamDto, @Body() updateWorkoutTemplateDto: UpdateWorkoutTemplateUserDto) {
    return this.workoutTemplatesService.update(params, updateWorkoutTemplateDto);
  }

  @Delete(":workoutId")
  remove(@Param() params: UserWorkoutTemplateParamDto) {
    return this.workoutTemplatesService.remove(params);
  }
}
