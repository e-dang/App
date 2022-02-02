import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "@core/entities/user.entity";
import {Repository} from "typeorm";
import {instanceToPlain} from "class-transformer";
import {WorkoutTemplate} from "./entities/workout-template.entity";
import {CreateWorkoutTemplateAdminDto, UpdateWorkoutTemplateAdminDto} from "./dto/workout-template-body.dto";

@Injectable()
export class WorkoutTemplatesAdminService {
  constructor(
    @InjectRepository(WorkoutTemplate) private readonly workoutTemplateRepository: Repository<WorkoutTemplate>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createWorkoutTemplateDto: CreateWorkoutTemplateAdminDto) {
    await this.verifyUserExists(createWorkoutTemplateDto.ownerId);
    const workoutTemplate = this.workoutTemplateRepository.create(createWorkoutTemplateDto);
    return this.workoutTemplateRepository.save(workoutTemplate);
  }

  findAll() {
    return this.workoutTemplateRepository.find();
  }

  async findOne(id: string) {
    const workoutTemplate = await this.workoutTemplateRepository.findOne(id, {relations: ["exerciseGroups"]});
    if (!workoutTemplate) {
      throw new NotFoundException();
    }
    return workoutTemplate;
  }

  async update(id: string, updateWorkoutTemplateDto: UpdateWorkoutTemplateAdminDto) {
    const ownerExists = this.verifyUserExists(updateWorkoutTemplateDto.ownerId);
    const workoutTemplateExists = this.findOne(id);
    await Promise.all([ownerExists, workoutTemplateExists]);
    const updatedWorkoutTemplate = {
      ...instanceToPlain(updateWorkoutTemplateDto),
      id,
    };
    await this.workoutTemplateRepository.save(updatedWorkoutTemplate);
    return this.findOne(id);
  }

  async remove(id: string) {
    const workoutTemplate = await this.findOne(id);
    await this.workoutTemplateRepository.softRemove(workoutTemplate);
  }

  private async verifyUserExists(userId: string) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException();
    }
  }
}
