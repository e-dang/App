import {getActionName, isErrorPayload, isPayloadAction} from '@src/utils';
import {ActionType, createAction} from 'typesafe-actions';

describe('action utils', () => {
    test('getActionName returns the string without _REQUEST in it', async () => {
        const actionType = 'TEST_ACTION_REQUEST';

        const retVal = getActionName(actionType);

        expect(retVal).toBe('TEST_ACTION');
    });

    test('getActionName returns the string without _SUCCESS in it', async () => {
        const actionType = 'TEST_ACTION_SUCCESS';

        const retVal = getActionName(actionType);

        expect(retVal).toBe('TEST_ACTION');
    });

    test('getActionName returns the string without _FAILURE in it', async () => {
        const actionType = 'TEST_ACTION_FAILURE';

        const retVal = getActionName(actionType);

        expect(retVal).toBe('TEST_ACTION');
    });

    test('getActionName returns the string without _CANCEL in it', async () => {
        const actionType = 'TEST_ACTION_CANCEL';

        const retVal = getActionName(actionType);

        expect(retVal).toBe('TEST_ACTION');
    });

    test('isPayloadAction returns true when the action has payload property', async () => {
        const testAction = createAction('TEST_ACTION', () => null)();
        const action: ActionType<typeof testAction> = {
            type: 'TEST_ACTION',
            payload: null,
        };

        const retVal = isPayloadAction(action);

        expect(retVal).toBe(true);
    });

    test('isPayloadAction returns false when the action does not have a payload property', async () => {
        const testAction = createAction('TEST_ACTION')();
        const action: ActionType<typeof testAction> = {
            type: 'TEST_ACTION',
        };

        const retVal = isPayloadAction(action);

        expect(retVal).toBe(false);
    });

    test('isErrorPayload returns true when action is a failed action and has string payload', async () => {
        const testAction = createAction('TEST_ACTION_FAILURE', () => 'Error')();
        const action: ActionType<typeof testAction> = {
            type: 'TEST_ACTION_FAILURE',
            payload: 'Error',
        };

        const retVal = isErrorPayload(action);

        expect(retVal).toBe(true);
    });

    test('isErrorPayload returns false when action is not failed action and has string payload', async () => {
        const testAction = createAction('TEST_ACTION_SUCCESS', () => 'Error')();
        const action: ActionType<typeof testAction> = {
            type: 'TEST_ACTION_SUCCESS',
            payload: 'Error',
        };

        const retVal = isErrorPayload(action);

        expect(retVal).toBe(false);
    });

    test('isErrorPayload returns false when action is a failed action and but payload is not a string', async () => {
        const testAction = createAction('TEST_ACTION_FAILURE', () => 1)();
        const action: ActionType<typeof testAction> = {
            type: 'TEST_ACTION_FAILURE',
            payload: 1,
        };

        const retVal = isErrorPayload(action);

        expect(retVal).toBe(false);
    });
});
