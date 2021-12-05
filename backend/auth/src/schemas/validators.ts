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

export const confirmPasswordMatchValidator = {
    custom: {
        options: (val: string, {req}) => {
            if (val !== req.body.newPassword) {
                throw new Error("Password confirmation doesn't match the password.");
            }
            return true;
        },
    },
};
