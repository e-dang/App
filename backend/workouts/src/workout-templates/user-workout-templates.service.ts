import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {instanceToPlain} from "class-transformer";
import {UserScopedParamDto} from "@core/dto";
import {Repository} from "typeorm";
import {UserWorkoutTemplateParamDto} from "./dto/workout-template-params.dto";
import {WorkoutTemplate} from "./entities/workout-template.entity";
import {CreateWorkoutTemplateUserDto, UpdateWorkoutTemplateUserDto} from "./dto/workout-template-body.dto";

@Injectable()
export class UserWorkoutTemplatesService {
  constructor(
    @InjectRepository(WorkoutTemplate) private readonly workoutTemplateRepository: Repository<WorkoutTemplate>,
  ) {}

  create({ownerId}: UserScopedParamDto, createWorkoutTemplateDto: CreateWorkoutTemplateUserDto) {
    const workoutTemplate = this.workoutTemplateRepository.create({
      ...instanceToPlain(createWorkoutTemplateDto),
      ownerId,
    });
    return this.workoutTemplateRepository.save(workoutTemplate);
  }

  findAll(params: UserScopedParamDto) {
    return this.workoutTemplateRepository.find(params);
  }

  async findOne({ownerId, workoutId}: UserWorkoutTemplateParamDto) {
    const result = await this.workoutTemplateRepository
      .createQueryBuilder("workoutTemplates")
      .leftJoinAndSelect("workoutTemplates.exerciseGroups", "exerciseGroupTemplates")
      .leftJoinAndSelect("exerciseGroupTemplates.exercises", "exerciseTemplates")
      .leftJoinAndSelect("exerciseTemplates.type", "exerciseType")
      .where("workoutTemplates.id = :workoutId", {workoutId})
      .andWhere("workoutTemplates.ownerId = :ownerId", {ownerId})
      .orderBy("exerciseGroupTemplates.index", "ASC")
      .addOrderBy("exerciseTemplates.index", "ASC")
      .getOne();
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async update(params: UserWorkoutTemplateParamDto, updateWorkoutTemplateDto: UpdateWorkoutTemplateUserDto) {
    const workoutTemplate = await this.workoutTemplateRepository.findOne({
      id: params.workoutId,
      ownerId: params.ownerId,
    });
    if (!workoutTemplate) {
      throw new NotFoundException();
    }
    const updatedWorkoutTemplate = {
      ...instanceToPlain(updateWorkoutTemplateDto),
      id: params.workoutId,
      ownerId: params.ownerId,
    };
    await this.workoutTemplateRepository.save(updatedWorkoutTemplate);
    return this.findOne(params);
  }

  async remove(params: UserWorkoutTemplateParamDto) {
    const workoutTemplate = await this.findOne(params);
    return this.workoutTemplateRepository.softRemove(workoutTemplate);
  }
}
