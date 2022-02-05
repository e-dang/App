import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {ExerciseGroupTemplatesService} from "./user-exercise-group-templates.service";
import {ExerciseGroupTemplatesController} from "./user-exercise-group-templates.controller";
import {ExerciseGroupTemplate} from "./entities/exercise-group-template.entity";
import {AdminExerciseGroupTemplatesController} from "./admin-exercise-group-templates.controller";
import {AdminExerciseGroupTemplatesService} from "./admin-exercise-group-templates.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseGroupTemplate, WorkoutTemplate])],
  controllers: [ExerciseGroupTemplatesController, AdminExerciseGroupTemplatesController],
  providers: [ExerciseGroupTemplatesService, AdminExerciseGroupTemplatesService],
})
export class ExerciseGroupTemplatesModule {}
