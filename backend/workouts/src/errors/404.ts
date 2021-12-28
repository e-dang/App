import {DomainError, DomainErrorDetails} from "./base";

class ResourceNotFoundError extends DomainError {
  constructor(errors: DomainErrorDetails) {
    super(404, errors);
  }
}

export class WorkoutNotFoundError extends ResourceNotFoundError {
  constructor(userId: string, workoutId: string) {
    super([
      {
        msg: `Could not find a workout with id ${workoutId} belonging to user with id ${userId}`,
        location: "params",
        param: "workoutId",
        value: workoutId,
      },
    ]);
  }
}
