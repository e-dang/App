import {passwordIsValid} from '@auth';
import {createValidationSchemaMiddleware} from '@src/middleware';
import {isEmailValidator, notEmptyValidator, strongPasswordValidator} from './validators';

export const validateSignInRequest = createValidationSchemaMiddleware({
    email: {
        in: ['body'],
        ...notEmptyValidator,
        ...isEmailValidator,
    },
    password: {
        in: ['body'],
        ...notEmptyValidator,
    },
});

export const validateSignUpRequest = createValidationSchemaMiddleware({
    name: {
        in: ['body'],
        ...notEmptyValidator,
    },
    email: {
        in: ['body'],
        ...notEmptyValidator,
        ...isEmailValidator,
    },
    password: {
        in: ['body'],
        ...notEmptyValidator,
        ...strongPasswordValidator,
    },
});

export const validateChangePasswordRequest = createValidationSchemaMiddleware({
    oldPassword: {
        in: ['body'],
        ...notEmptyValidator,
        custom: {
            options: (val: string, {req}) => {
                if (!passwordIsValid(val, req.user.password)) {
                    throw new Error('The old password is incorrect.');
                }
                return true;
            },
        },
    },
    newPassword: {
        in: ['body'],
        ...notEmptyValidator,
        ...strongPasswordValidator,
    },
    confirmPassword: {
        in: ['body'],
        ...notEmptyValidator,
        custom: {
            options: (val: string, {req}) => {
                if (val !== req.body.newPassword) {
                    throw new Error("Password confirmation doesn't match the password.");
                }
                return true;
            },
        },
    },
});

export const validateRefreshTokenRequest = createValidationSchemaMiddleware({
    refreshToken: {
        in: ['body'],
        ...notEmptyValidator,
        isJWT: {
            errorMessage: 'Malformed token.',
        },
    },
});
