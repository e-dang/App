import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserScopedParamDto} from "@core/dto/user-scoped.dto";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {Repository} from "typeorm";
import {UserExerciseGroupTemplateParamDto} from "./dto/exercise-group-template-params.dto";
import {ExerciseGroupTemplate} from "./entities/exercise-group-template.entity";
import {CreateExerciseGroupTemplateDto, UpdateExerciseGroupTemplateDto} from "./dto/exercise-group-template-body.dto";

@Injectable()
export class ExerciseGroupTemplatesService {
  constructor(
    @InjectRepository(ExerciseGroupTemplate)
    private readonly exerciseGroupTemplateRepository: Repository<ExerciseGroupTemplate>,
    @InjectRepository(WorkoutTemplate)
    private readonly workoutTemplateRepository: Repository<WorkoutTemplate>,
  ) {}

  async create({ownerId}: UserScopedParamDto, createExerciseGroupTemplateDto: CreateExerciseGroupTemplateDto) {
    await this.verifyUserOwnsWorkoutTemplate(ownerId, createExerciseGroupTemplateDto.workoutId);
    const exerciseGroupTemplate = this.exerciseGroupTemplateRepository.create(createExerciseGroupTemplateDto);
    return this.exerciseGroupTemplateRepository.save(exerciseGroupTemplate);
  }

  findAll({ownerId}: UserScopedParamDto) {
    return this.exerciseGroupTemplateRepository
      .createQueryBuilder("exerciseGroupTemplate")
      .leftJoin("exerciseGroupTemplate.workout", "workout")
      .leftJoinAndSelect("exerciseGroupTemplate.exercises", "exercises")
      .where("workout.ownerId = :ownerId", {ownerId})
      .orderBy("exerciseGroupTemplate.workoutId", "ASC")
      .addOrderBy("exerciseGroupTemplate.index", "ASC")
      .getMany();
  }

  async findOne({ownerId, exerciseGroupId}: UserExerciseGroupTemplateParamDto) {
    try {
      return await this.exerciseGroupTemplateRepository
        .createQueryBuilder("exerciseGroupTemplate")
        .leftJoin("exerciseGroupTemplate.workout", "workout")
        .leftJoinAndSelect("exerciseGroupTemplate.exercises", "exercises")
        .leftJoinAndSelect("exercises.type", "exerciseType")
        .where("workout.ownerId = :ownerId", {ownerId})
        .andWhere("exerciseGroupTemplate.id = :exerciseGroupId", {exerciseGroupId})
        .getOneOrFail();
    } catch (err) {
      throw new NotFoundException();
    }
  }

  async update(
    params: UserExerciseGroupTemplateParamDto,
    updateExerciseGroupTemplateDto: UpdateExerciseGroupTemplateDto,
  ) {
    const exerciseGroupTemplate = await this.findOne(params);
    if (updateExerciseGroupTemplateDto.workoutId) {
      await this.verifyUserOwnsWorkoutTemplate(params.ownerId, updateExerciseGroupTemplateDto.workoutId);
    }
    const updatedExerciseGroupTemplate = this.exerciseGroupTemplateRepository.merge(
      exerciseGroupTemplate,
      updateExerciseGroupTemplateDto,
    );
    await this.exerciseGroupTemplateRepository.save(updatedExerciseGroupTemplate);
    return this.findOne(params);
  }

  async remove(params: UserExerciseGroupTemplateParamDto) {
    const exerciseGroupTemplate = await this.findOne(params);
    await this.exerciseGroupTemplateRepository.remove([exerciseGroupTemplate]);
  }

  private async verifyUserOwnsWorkoutTemplate(userId: string, workoutId: string) {
    try {
      await this.workoutTemplateRepository.findOneOrFail({
        id: workoutId,
        ownerId: userId,
      });
    } catch (err) {
      throw new BadRequestException("The specified workout template does not exist for the specified user");
    }
  }
}
