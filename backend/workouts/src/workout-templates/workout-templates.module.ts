import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "@core/entities/user.entity";
import {WorkoutTemplate} from "./entities/workout-template.entity";
import {UserWorkoutTemplatesService} from "./user-workout-templates.service";
import {UserWorkoutTemplatesController} from "./user-workout-templates.controller";
import {WorkoutTemplatesAdminController} from "./admin-workout-templates.controller";
import {WorkoutTemplatesAdminService} from "./admin-workout-templates.service";

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutTemplate, User])],
  controllers: [UserWorkoutTemplatesController, WorkoutTemplatesAdminController],
  providers: [UserWorkoutTemplatesService, WorkoutTemplatesAdminService],
})
export class WorkoutTemplatesModule {}
