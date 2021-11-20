export const notEmptyValidator = {
    isEmpty: {
        errorMessage: 'This field is required.',
        negated: true,
    },
};

export const isEmailValidator = {
    isEmail: {
        errorMessage: 'The provided email address is invalid.',
    },
};

export const strongPasswordValidator = {
    isStrongPassword: {
        errorMessage:
            'The password must be at least 8 characters long, with at least 1 lower case and upper case letter, 1 symbol, and 1 number.',
    },
};
