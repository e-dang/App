import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "@core/entities";
import {ExerciseTypesAdminService} from "./admin-exercise-types.service";
import {ExerciseTypesAdminController} from "./admin-exercise-types.controller";
import {ExerciseType} from "./entities/exercise-type.entity";
import {ExerciseTypesController} from "./user-exercise-types.controller";
import {ExerciseTypesService} from "./user-exercise-types.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseType, User])],
  controllers: [ExerciseTypesController, ExerciseTypesAdminController],
  providers: [ExerciseTypesService, ExerciseTypesAdminService],
})
export class ExerciseTypesModule {}
