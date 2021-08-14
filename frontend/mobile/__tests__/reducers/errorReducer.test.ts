import {RootAction} from '@actions';
import {errorReducer, ErrorState} from '@reducers';
import {AuthToken} from '@src/types';
import {mock} from 'jest-mock-extended';

describe('test errorReducer', () => {
    let state: ErrorState;

    beforeEach(() => {
        state = {};
    });

    test('if action ends with _SUCCESS the error state for that action is set to null', async () => {
        const action: RootAction = {
            type: 'REGISTER_SUCCESS',
            payload: mock<AuthToken>(),
        };

        const retVal = errorReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.error).toBe(null);
    });

    test('if action ends with _FAILURE the error state for that action is set to the action payload', async () => {
        const payload = new Error('Failure');
        const action: RootAction = {
            type: 'REGISTER_FAILURE',
            payload,
        };

        const retVal = errorReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.error).toBe(payload.message);
    });
});
