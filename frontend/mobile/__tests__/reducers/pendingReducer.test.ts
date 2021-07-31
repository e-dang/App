import {RootAction} from '@src/actions/actionTypes';
import pendingReducer, {PendingState} from '@src/reducers/pendingReducer';
import {RegistrationInfo} from '@src/types/auth';
import {mock} from 'jest-mock-extended';

describe('pendingReducer', () => {
    let state: PendingState;

    beforeEach(() => {
        state = {};
    });

    test('if action ends with _REQUEST, it sets pending on the action name in the current state to true', async () => {
        const action: RootAction = {
            type: 'REGISTER_REQUEST',
            payload: mock<RegistrationInfo>(),
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.pending).toBe(true);
    });

    test('if action ends with _SUCCESS, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'REGISTER_SUCCESS',
            payload: null,
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.pending).toBe(false);
    });

    test('if action ends with _FAILURE, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'REGISTER_FAILURE',
            payload: new Error(),
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.pending).toBe(false);
    });

    test('if action ends with _CANCEL, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'REGISTER_CANCEL',
            payload: null,
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('REGISTER');
        expect(retVal.REGISTER.pending).toBe(false);
    });
});
