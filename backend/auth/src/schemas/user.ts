import {createValidationSchemaMiddleware} from "@src/middleware";
import {isEmailValidator, notEmptyValidator} from "./validators";

export const validatePatchUserRequest = createValidationSchemaMiddleware({
  email: {
    in: ["body"],
    optional: true,
    ...isEmailValidator,
  },
  name: {
    in: ["body"],
    optional: true,
    ...notEmptyValidator,
  },
});
