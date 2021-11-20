import {passwordIsValid} from '@auth';
import {NextFunction, Request, Response} from 'express';
import {validationResult, ValidationChain, checkSchema} from 'express-validator';

// parallel processing
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({errors: errors.array()});
    };
};

const notEmptyValidator = {
    isEmpty: {
        errorMessage: 'This field is required.',
        negated: true,
    },
};

const isEmailValidator = {
    isEmail: {
        errorMessage: 'The provided email address is invalid.',
    },
};

const strongPasswordValidator = {
    isStrongPassword: {
        errorMessage:
            'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
    },
};

export const signInSchema = checkSchema({
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

export const signUpSchema = checkSchema({
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

export const changePasswordSchema = checkSchema({
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

export const refreshTokenSchema = checkSchema({
    refreshToken: {
        in: ['body'],
        ...notEmptyValidator,
        isJWT: {
            errorMessage: 'Malformed token.',
        },
    },
});
