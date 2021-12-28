import {createValidationSchemaMiddleware} from "@src/middleware";
import {notEmptyValidator} from "./validators";

export const validateCreateExerciseRequest = createValidationSchemaMiddleware({
  name: {
    in: ["body"],
    ...notEmptyValidator,
  },
});
