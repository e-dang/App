import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserScopedParamDto} from "@core/dto";
import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {Repository} from "typeorm";
import {UserExerciseTemplateParamDto} from "./dto/exercise-template-params.dto";
import {ExerciseTemplate} from "./entities/exercise-template.entity";
import {CreateExerciseTemplateDto, UpdateExerciseTemplateDto} from "./dto/exercise-template-body.dto";

@Injectable()
export class ExerciseTemplateService {
  constructor(
    @InjectRepository(ExerciseTemplate) private readonly exerciseTemplateRepository: Repository<ExerciseTemplate>,
    @InjectRepository(ExerciseGroupTemplate)
    private readonly exerciseGroupTemplateRepository: Repository<ExerciseGroupTemplate>,
  ) {}

  async create({ownerId}: UserScopedParamDto, createExerciseTemplateDto: CreateExerciseTemplateDto) {
    await this.verifyUserOwnsExerciseGroup(ownerId, createExerciseTemplateDto.exerciseGroupId);
    let exerciseTemplate = this.exerciseTemplateRepository.create(createExerciseTemplateDto);
    exerciseTemplate = await this.exerciseTemplateRepository.save(exerciseTemplate);
    return this.findOne({ownerId, exerciseId: exerciseTemplate.id});
  }

  findAll({ownerId}: UserScopedParamDto) {
    return this.exerciseTemplateRepository
      .createQueryBuilder("exerciseTemplates")
      .leftJoin("exerciseTemplates.exerciseGroup", "exerciseGroup")
      .leftJoin("exerciseGroup.workout", "workout")
      .leftJoinAndSelect("exerciseTemplates.type", "type")
      .where("workout.ownerId = :ownerId", {ownerId})
      .orderBy("exerciseTemplates.index", "ASC")
      .getMany();
  }

  async findOne({ownerId, exerciseId}: UserExerciseTemplateParamDto) {
    try {
      return await this.exerciseTemplateRepository
        .createQueryBuilder("exerciseTemplates")
        .leftJoin("exerciseTemplates.exerciseGroup", "exerciseGroup")
        .leftJoin("exerciseGroup.workout", "workout")
        .leftJoinAndSelect("exerciseTemplates.type", "type")
        .where("exerciseTemplates.id = :exerciseId", {exerciseId})
        .andWhere("workout.ownerId = :ownerId", {ownerId})
        .getOneOrFail();
    } catch (err) {
      throw new NotFoundException();
    }
  }

  async update(params: UserExerciseTemplateParamDto, updateExerciseTemplateDto: UpdateExerciseTemplateDto) {
    const exerciseTemplate = await this.findOne(params);
    if (updateExerciseTemplateDto.exerciseGroupId) {
      await this.verifyUserOwnsExerciseGroup(params.ownerId, updateExerciseTemplateDto.exerciseGroupId);
    }
    const updatedExerciseTemplate = this.exerciseTemplateRepository.merge(exerciseTemplate, updateExerciseTemplateDto);
    await this.exerciseTemplateRepository.save(updatedExerciseTemplate);
    return this.findOne(params);
  }

  async remove(params: UserExerciseTemplateParamDto) {
    const exerciseTemplate = await this.findOne(params);
    await this.exerciseTemplateRepository.remove(exerciseTemplate);
  }

  private async verifyUserOwnsExerciseGroup(userId: string, exerciseGroupId: string) {
    try {
      await this.exerciseGroupTemplateRepository
        .createQueryBuilder("exerciseGroupTemplate")
        .leftJoin("exerciseGroupTemplate.workout", "workout")
        .where("workout.ownerId = :userId", {userId})
        .andWhere("exerciseGroupTemplate.id = :exerciseGroupId", {exerciseGroupId})
        .getOneOrFail();
    } catch (err) {
      throw new BadRequestException("The specified workout template does not exist for the specified user");
    }
  }
}
