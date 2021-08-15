import {RootAction} from '@src/actions/actionTypes';
import {pendingReducer, PendingState} from '@src/reducers/pendingReducer';
import {AuthToken} from '@src/types';
import {RegistrationInfo} from '@src/types';
import {mock} from 'jest-mock-extended';

describe('pendingReducer', () => {
    let state: PendingState;

    beforeEach(() => {
        state = {};
    });

    test('if action ends with _REQUEST, it sets pending on the action name in the current state to true', async () => {
        const action: RootAction = {
            type: 'SIGN_UP_REQUEST',
            payload: mock<RegistrationInfo>(),
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('SIGN_UP');
        expect(retVal.SIGN_UP.pending).toBe(true);
    });

    test('if action ends with _SUCCESS, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'SIGN_UP_SUCCESS',
            payload: mock<AuthToken>(),
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('SIGN_UP');
        expect(retVal.SIGN_UP.pending).toBe(false);
    });

    test('if action ends with _FAILURE, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'SIGN_UP_FAILURE',
            payload: new Error('Failure'),
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('SIGN_UP');
        expect(retVal.SIGN_UP.pending).toBe(false);
    });

    test('if action ends with _CANCEL, it sets pending on the action name in the current state to false', async () => {
        const action: RootAction = {
            type: 'SIGN_UP_CANCEL',
        };

        const retVal = pendingReducer(state, action);

        expect(retVal).toHaveProperty('SIGN_UP');
        expect(retVal.SIGN_UP.pending).toBe(false);
    });
});
