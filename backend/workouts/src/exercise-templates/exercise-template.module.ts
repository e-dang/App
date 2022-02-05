import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {ExerciseTemplateService} from "./user-exercise-template.service";
import {ExerciseTemplateController} from "./user-exercise-template.controller";
import {ExerciseTemplate} from "./entities/exercise-template.entity";
import {ExerciseTemplateAdminController} from "./admin-exercise-template.controller";
import {ExerciseTemplateAdminService} from "./admin-exercise-template.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseTemplate, ExerciseType, ExerciseGroupTemplate])],
  controllers: [ExerciseTemplateController, ExerciseTemplateAdminController],
  providers: [ExerciseTemplateService, ExerciseTemplateAdminService],
})
export class ExerciseTemplateModule {}
