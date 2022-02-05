import {ExerciseGroupTemplate} from "@exercise-group-templates/entities/exercise-group-template.entity";
import {ExerciseType} from "@exercise-types/entities/exercise-type.entity";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateExerciseTemplateDto, UpdateExerciseTemplateDto} from "./dto/exercise-template-body.dto";
import {ExerciseTemplate} from "./entities/exercise-template.entity";

@Injectable()
export class ExerciseTemplateAdminService {
  constructor(
    @InjectRepository(ExerciseTemplate) private readonly exerciseTemplateRepository: Repository<ExerciseTemplate>,
    @InjectRepository(ExerciseType) private readonly exerciseTypeRepository: Repository<ExerciseType>,
    @InjectRepository(ExerciseGroupTemplate)
    private readonly exerciseGroupTemplateRepository: Repository<ExerciseGroupTemplate>,
  ) {}

  async create(createExerciseTemplateDto: CreateExerciseTemplateDto) {
    await this.validateUserOwnsExerciseType(
      createExerciseTemplateDto.typeId,
      createExerciseTemplateDto.exerciseGroupId,
    );
    let exerciseTemplate = this.exerciseTemplateRepository.create(createExerciseTemplateDto);
    exerciseTemplate = await this.exerciseTemplateRepository.save(exerciseTemplate);
    return this.findOne(exerciseTemplate.id);
  }

  findAll() {
    return this.exerciseTemplateRepository.find({relations: ["type"]});
  }

  async findOne(id: string) {
    const exerciseTemplate = await this.exerciseTemplateRepository.findOne(id);
    if (!exerciseTemplate) {
      throw new NotFoundException();
    }
    return exerciseTemplate;
  }

  async update(id: string, updateExerciseTemplateDto: UpdateExerciseTemplateDto) {
    const exerciseTemplate = await this.findOne(id);
    if (updateExerciseTemplateDto.exerciseGroupId || updateExerciseTemplateDto.typeId) {
      const typeId = updateExerciseTemplateDto.typeId || exerciseTemplate.typeId;
      const exerciseGroupId = updateExerciseTemplateDto.exerciseGroupId || exerciseTemplate.exerciseGroupId;
      await this.validateUserOwnsExerciseType(typeId, exerciseGroupId);
    }
    const updatedExerciseTemplate = this.exerciseTemplateRepository.merge(exerciseTemplate, updateExerciseTemplateDto);
    return this.exerciseTemplateRepository.save(updatedExerciseTemplate);
  }

  async remove(id: string) {
    const exerciseTemplate = await this.findOne(id);
    await this.exerciseTemplateRepository.remove(exerciseTemplate);
  }

  async validateUserOwnsExerciseType(exerciseTypeId: string, exerciseGroupTemplateId: string) {
    const exerciseType = await this.exerciseTypeRepository.findOne(exerciseTypeId);
    if (!exerciseType) {
      throw new BadRequestException("The specified exercise type does not exist");
    }
    const exerciseGroupTemplate = await this.exerciseGroupTemplateRepository
      .createQueryBuilder("exerciseGroupTemplates")
      .leftJoinAndSelect("exerciseGroupTemplates.workout", "workout")
      .where("exerciseGroupTemplates.id = :exerciseGroupTemplateId", {exerciseGroupTemplateId})
      .andWhere("workout.ownerId = :ownerId", {ownerId: exerciseType.ownerId})
      .getOne();

    if (!exerciseGroupTemplate) {
      throw new BadRequestException("The same user does not own the exercise type and exercise group.");
    }
  }
}
