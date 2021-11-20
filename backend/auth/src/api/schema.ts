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

export const signUpSchema = checkSchema({
    name: {
        in: ['body'],
        ...notEmptyValidator,
    },
    email: {
        in: ['body'],
        ...notEmptyValidator,
        isEmail: {
            errorMessage: 'The provided email address is invalid.',
        },
    },
    password: {
        in: ['body'],
        ...notEmptyValidator,
        isStrongPassword: {
            errorMessage:
                'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
        },
    },
});
