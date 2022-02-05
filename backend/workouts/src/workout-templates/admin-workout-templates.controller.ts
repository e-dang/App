import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SerializeOptions,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import {Roles} from "@core/decorators/roles";
import {TransformResponseInterceptor} from "@core/interceptors/transform-response.interceptor";
import {WorkoutTemplatesAdminService} from "./admin-workout-templates.service";
import {WorkoutTemplateParamDto} from "./dto/workout-template-params.dto";
import {CreateWorkoutTemplateAdminDto, UpdateWorkoutTemplateAdminDto} from "./dto/workout-template-body.dto";

@Controller("templates/workouts")
@Roles("admin")
@UseInterceptors(ClassSerializerInterceptor)
@UseInterceptors(TransformResponseInterceptor)
@SerializeOptions({
  groups: ["admin"],
})
export class WorkoutTemplatesAdminController {
  constructor(private readonly workoutTemplatesService: WorkoutTemplatesAdminService) {}

  @Post()
  create(@Body() createWorkoutTemplateDto: CreateWorkoutTemplateAdminDto) {
    return this.workoutTemplatesService.create(createWorkoutTemplateDto);
  }

  @Get()
  findAll() {
    return this.workoutTemplatesService.findAll();
  }

  @Get(":workoutId")
  findOne(@Param() {workoutId}: WorkoutTemplateParamDto) {
    return this.workoutTemplatesService.findOne(workoutId);
  }

  @Patch(":workoutId")
  update(
    @Param() {workoutId}: WorkoutTemplateParamDto,
    @Body() updateWorkoutTemplateDto: UpdateWorkoutTemplateAdminDto,
  ) {
    return this.workoutTemplatesService.update(workoutId, updateWorkoutTemplateDto);
  }

  @Delete(":workoutId")
  remove(@Param() {workoutId}: WorkoutTemplateParamDto) {
    return this.workoutTemplatesService.remove(workoutId);
  }
}
