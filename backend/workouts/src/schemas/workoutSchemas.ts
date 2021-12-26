import {createValidationSchemaMiddleware} from "@src/middleware";
import {notEmptyValidator} from "./validators";

export const validateWorkoutDetailRequest = createValidationSchemaMiddleware({
  workoutId: {
    in: ["params"],
    ...notEmptyValidator,
    isUUID: {
      errorMessage: "Invalid id.",
    },
  },
});

export const validatePatchWorkoutRequest = createValidationSchemaMiddleware({
  workoutId: {
    in: ["params"],
    ...notEmptyValidator,
    isUUID: {
      errorMessage: "Invalid id.",
    },
  },
  name: {
    in: ["body"],
    isLength: {
      errorMessage: "The name cannot be blank.",
      options: {
        min: 1,
      },
    },
  },
});

export const validateDeleteWorkoutRequest = validateWorkoutDetailRequest;
