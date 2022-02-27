import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {instanceToPlain} from "class-transformer";
import {UserScopedParamDto} from "@core/dto";
import {Repository} from "typeorm";
import {ExerciseType} from "./entities/exercise-type.entity";
import {CreateExerciseTypeUserDto, UpdateExerciseTypeUserDto} from "./dto/exercise-type-body.dto";
import {UserExerciseTypeParamDto} from "./dto/exercise-type-params.dto";

@Injectable()
export class ExerciseTypesService {
  constructor(@InjectRepository(ExerciseType) private readonly exerciseTypeRepository: Repository<ExerciseType>) {}

  create({ownerId}: UserScopedParamDto, createExerciseTypeDto: CreateExerciseTypeUserDto) {
    const exerciseType = this.exerciseTypeRepository.create({
      ...instanceToPlain(createExerciseTypeDto),
      ownerId,
    });
    return this.exerciseTypeRepository.save(exerciseType);
  }

  findAll({ownerId}: UserScopedParamDto) {
    return this.exerciseTypeRepository.find({ownerId});
  }

  async findOne({ownerId, exerciseId}: UserExerciseTypeParamDto) {
    const exerciseType = await this.exerciseTypeRepository.findOne({id: exerciseId, ownerId});
    if (!exerciseType) {
      throw new NotFoundException();
    }
    return exerciseType;
  }

  async update({ownerId, exerciseId}: UserExerciseTypeParamDto, updateExerciseTypeDto: UpdateExerciseTypeUserDto) {
    const exerciseType = await this.findOne({ownerId, exerciseId});
    const updatedExerciseType = this.exerciseTypeRepository.merge(exerciseType, updateExerciseTypeDto);
    return this.exerciseTypeRepository.save(updatedExerciseType);
  }

  async remove(params: UserExerciseTypeParamDto) {
    const exerciseType = await this.findOne(params);
    await this.exerciseTypeRepository.softRemove(exerciseType);
  }
}
