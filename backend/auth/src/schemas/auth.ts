import {passwordIsValid} from "@auth";
import {createValidationSchemaMiddleware} from "@src/middleware";
import {
  confirmPasswordMatchValidator,
  isEmailValidator,
  notEmptyValidator,
  strongPasswordValidator,
} from "./validators";

export const validateSignInRequest = createValidationSchemaMiddleware({
  email: {
    in: ["body"],
    ...notEmptyValidator,
    ...isEmailValidator,
  },
  password: {
    in: ["body"],
    ...notEmptyValidator,
  },
});

export const validateSignUpRequest = createValidationSchemaMiddleware({
  name: {
    in: ["body"],
    ...notEmptyValidator,
  },
  email: {
    in: ["body"],
    ...notEmptyValidator,
    ...isEmailValidator,
  },
  password: {
    in: ["body"],
    ...notEmptyValidator,
    ...strongPasswordValidator,
  },
});

export const validateChangePasswordRequest = createValidationSchemaMiddleware({
  oldPassword: {
    in: ["body"],
    ...notEmptyValidator,
    custom: {
      options: (val: string, {req}) => {
        if (!passwordIsValid(val, req.user.password as string)) {
          throw new Error("The old password is incorrect.");
        }
        return true;
      },
    },
  },
  newPassword: {
    in: ["body"],
    ...notEmptyValidator,
    ...strongPasswordValidator,
  },
  confirmPassword: {
    in: ["body"],
    ...notEmptyValidator,
    ...confirmPasswordMatchValidator,
  },
});

export const validatePasswordResetRequest = createValidationSchemaMiddleware({
  email: {
    in: ["body"],
    ...notEmptyValidator,
    ...isEmailValidator,
  },
});

export const validatePasswordResetConfirmRequest = createValidationSchemaMiddleware({
  userId: {
    in: ["body"],
    ...notEmptyValidator,
    isUUID: {
      errorMessage: "The userId must be a uuid.",
    },
  },
  token: {
    in: ["body"],
    ...notEmptyValidator,
  },
  newPassword: {
    in: ["body"],
    ...notEmptyValidator,
    ...strongPasswordValidator,
  },
  confirmPassword: {
    in: ["body"],
    ...notEmptyValidator,
    ...confirmPasswordMatchValidator,
  },
});
