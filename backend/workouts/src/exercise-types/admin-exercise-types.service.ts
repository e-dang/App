import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@core/entities/user.entity";
import {Repository} from "typeorm";
import {instanceToPlain} from "class-transformer";
import {ExerciseType} from "./entities/exercise-type.entity";
import {CreateExerciseTypeAdminDto, UpdateExerciseTypeAdminDto} from "./dto/exercise-type-body.dto";

@Injectable()
export class ExerciseTypesAdminService {
  constructor(
    @InjectRepository(ExerciseType) private readonly exerciseTypeRepository: Repository<ExerciseType>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createExerciseTypeDto: CreateExerciseTypeAdminDto) {
    await this.verifyUserExists(createExerciseTypeDto.ownerId);
    const exerciseType = this.exerciseTypeRepository.create(createExerciseTypeDto);
    return this.exerciseTypeRepository.save(exerciseType);
  }

  findAll() {
    return this.exerciseTypeRepository.find();
  }

  async findOne(id: string) {
    const exerciseType = await this.exerciseTypeRepository.findOne(id);
    if (!exerciseType) {
      throw new NotFoundException();
    }
    return exerciseType;
  }

  async update(id: string, updateExerciseTypeDto: UpdateExerciseTypeAdminDto) {
    const validations: Promise<ExerciseType | void>[] = [];
    validations.push(this.findOne(id));
    if (updateExerciseTypeDto.ownerId) {
      validations.push(this.verifyUserExists(updateExerciseTypeDto.ownerId));
    }
    await Promise.all(validations);

    await this.exerciseTypeRepository.save({...instanceToPlain(updateExerciseTypeDto), id});
    return this.findOne(id);
  }

  async remove(id: string) {
    const exerciseType = await this.findOne(id);
    await this.exerciseTypeRepository.softRemove(exerciseType);
  }

  private async verifyUserExists(userId: string) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException("A User with that id doesn't exist");
    }
  }
}
