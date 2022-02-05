import {randomUUID} from "crypto";
import * as jose from "jose";
import {User} from "@core/entities/user.entity";
import {AccessTokenPayload, Role} from "@core/types";
import {WorkoutTemplate} from "@workout-templates/entities/workout-template.entity";
import {DeepPartial, getRepository} from "typeorm";
import MockDate from "mockdate";
import {ExerciseGroupTemplate} from "@src/exercise-group-templates/entities/exercise-group-template.entity";
import {ExerciseTemplate, Unit} from "@src/exercise-templates/entities/exercise-template.entity";
import {ExerciseType} from "@src/exercise-types/entities/exercise-type.entity";

export async function createToken(payload: AccessTokenPayload, exp: string | number = "5m") {
  return new jose.SignJWT(payload)
    .setProtectedHeader({alg: "EdDSA", typ: "JWT"})
    .setIssuedAt()
    .setIssuer("dev.erickdang.com")
    .setAudience("dev.erickdang.com")
    .setExpirationTime(exp)
    .sign(await jose.importPKCS8(process.env.accessTokenPrivateKey, "EdDSA"));
}

export async function createUserWithRoleAndToken(role: Role): Promise<[User, string]> {
  const userId = randomUUID();
  const accessToken = await createToken({userId, role});
  const repo = getRepository(User);
  let user = repo.create({id: userId});
  user = await repo.save(user);
  return [user, accessToken];
}

export function createUserAndToken(): Promise<[User, string]> {
  return createUserWithRoleAndToken("user");
}

export function createAdminUserAndToken(): Promise<[User, string]> {
  return createUserWithRoleAndToken("admin");
}

export const decode = <T>(jwt: string) => {
  const tokenParts = jwt.split(".");
  return JSON.parse(Buffer.from(tokenParts[1], "base64").toString()) as T;
};

export function expireToken(accessToken: string) {
  const payload = decode<AccessTokenPayload>(accessToken);
  MockDate.set(payload.exp * 1000 + 2000);
}

export function createExerciseTypeData(data?: DeepPartial<ExerciseType>) {
  return {
    name: "Barbell Bench Press",
    ...data,
  } as DeepPartial<ExerciseType>;
}

export function createExerciseTemplateData(num?: number, data?: DeepPartial<ExerciseTemplate>) {
  return {
    index: num,
    targetReps: num,
    targetSets: num,
    targetWeight: num,
    unit: Math.random() > 0.5 ? Unit.Pound : Unit.Kilogram,
    ...data,
  } as DeepPartial<ExerciseTemplate>;
}

export function createExerciseGroupTemplateData(data?: DeepPartial<ExerciseGroupTemplate>) {
  return {
    index: 0,
    exercises: [],
    ...data,
  } as DeepPartial<ExerciseGroupTemplate>;
}

export function createWorkoutTemplateData(data?: DeepPartial<WorkoutTemplate>) {
  return {
    name: "test",
    notes: "this is a test note",
    exerciseGroups: [],
    ...data,
  } as DeepPartial<WorkoutTemplate>;
}

export function addExerciseGroupTemplateData(
  workoutTemplate: DeepPartial<WorkoutTemplate>,
  data?: DeepPartial<ExerciseGroupTemplate>,
) {
  const exerciseGroupTemplate = createExerciseGroupTemplateData(data);
  workoutTemplate.exerciseGroups.push(exerciseGroupTemplate);
  return exerciseGroupTemplate;
}

export function addExerciseTemplateData(
  exerciseGroupTemplate: DeepPartial<ExerciseGroupTemplate>,
  num?: number,
  data?: DeepPartial<ExerciseTemplate>,
) {
  const exerciseTemplate = createExerciseTemplateData(num, data);
  exerciseGroupTemplate.exercises.push(exerciseTemplate);
  return exerciseTemplate;
}

export function createWorkoutTemplatesForUser(user: User) {
  const repo = getRepository(WorkoutTemplate);
  const workoutTemplatesData: DeepPartial<WorkoutTemplate>[] = [
    createWorkoutTemplateData({name: "test1", ownerId: user.id}),
    createWorkoutTemplateData({name: "test2", ownerId: user.id}),
  ];
  const workoutTemplates = repo.create(workoutTemplatesData);
  return repo.save(workoutTemplates);
}

export function createExerciseTypesForUser(user: User) {
  const repo = getRepository(ExerciseType);
  const exerciseTypeData: DeepPartial<ExerciseType>[] = [
    createExerciseTypeData({ownerId: user.id}),
    createExerciseTypeData({name: "Barbell Squats", ownerId: user.id}),
  ];
  const exerciseTypes = repo.create(exerciseTypeData);
  return repo.save(exerciseTypes);
}

export function addExerciseGroupTemplate(workoutTemplate: WorkoutTemplate, data?: DeepPartial<ExerciseGroupTemplate>) {
  const repo = getRepository(ExerciseGroupTemplate);
  const exerciseGroupTemplateData = createExerciseGroupTemplateData({...data, workoutId: workoutTemplate.id});
  const exerciseGroupTemplate = repo.create(exerciseGroupTemplateData);
  return repo.save(exerciseGroupTemplate);
}

export function addExerciseTemplate(
  exerciseGroupTemplate: ExerciseGroupTemplate,
  exerciseType: ExerciseType,
  num?: number,
  data?: DeepPartial<ExerciseTemplate>,
) {
  const repo = getRepository(ExerciseTemplate);
  const exerciseTemplateData = createExerciseTemplateData(num, {
    ...data,
    exerciseGroupId: exerciseGroupTemplate.id,
    typeId: exerciseType.id,
    type: exerciseType,
  });
  const exerciseTemplate = repo.create(exerciseTemplateData);
  return repo.save(exerciseTemplate);
}
