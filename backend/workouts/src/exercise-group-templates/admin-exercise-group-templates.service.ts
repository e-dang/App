import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {Repository} from "typeorm";
import {CreateExerciseGroupTemplateDto, UpdateExerciseGroupTemplateDto} from "./dto/exercise-group-template-body.dto";
import {ExerciseGroupTemplate} from "./entities/exercise-group-template.entity";

@Injectable()
export class AdminExerciseGroupTemplatesService {
  constructor(
    @InjectRepository(ExerciseGroupTemplate)
    private readonly exerciseGroupTemplateRepository: Repository<ExerciseGroupTemplate>,
    @InjectRepository(WorkoutTemplate) private readonly workoutTemplateRepository: Repository<WorkoutTemplate>,
  ) {}

  async create(createExerciseGroupTemplateDto: CreateExerciseGroupTemplateDto) {
    await this.verifyWorkoutTemplateExists(createExerciseGroupTemplateDto.workoutId);
    const exerciseGroupTemplate = this.exerciseGroupTemplateRepository.create(createExerciseGroupTemplateDto);
    return this.exerciseGroupTemplateRepository.save(exerciseGroupTemplate);
  }

  findAll() {
    return this.exerciseGroupTemplateRepository.find();
  }

  async findOne(id: string) {
    const exerciseGroupTemplate = await this.exerciseGroupTemplateRepository.findOne(id);
    if (!exerciseGroupTemplate) {
      throw new NotFoundException();
    }
    return exerciseGroupTemplate;
  }

  async update(id: string, updateExerciseGroupTemplateDto: UpdateExerciseGroupTemplateDto) {
    const exerciseGroupTemplate = await this.findOne(id);
    if (updateExerciseGroupTemplateDto.workoutId) {
      await this.verifyWorkoutTemplateExists(updateExerciseGroupTemplateDto.workoutId);
    }
    const updatedExerciseGroupTemplate = this.exerciseGroupTemplateRepository.merge(
      exerciseGroupTemplate,
      updateExerciseGroupTemplateDto,
    );
    return this.exerciseGroupTemplateRepository.save(updatedExerciseGroupTemplate);
  }

  async remove(id: string) {
    const exerciseGroupTemplate = await this.findOne(id);
    await this.exerciseGroupTemplateRepository.remove(exerciseGroupTemplate);
  }

  private async verifyWorkoutTemplateExists(workoutId: string) {
    const workoutTemplate = await this.workoutTemplateRepository.findOne(workoutId);
    if (!workoutTemplate) {
      throw new BadRequestException("The specified workout template doesn't exist");
    }
  }
}
