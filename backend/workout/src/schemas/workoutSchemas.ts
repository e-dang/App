import {createValidationSchemaMiddleware} from '@src/middleware';
import {notEmptyValidator} from './validators';

export const validateWorkoutDetailRequest = createValidationSchemaMiddleware({
    workoutId: {
        in: ['params'],
        ...notEmptyValidator,
        isUUID: {
            errorMessage: 'Invalid id.',
        },
    },
});
