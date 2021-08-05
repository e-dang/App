import {getActionName, isPayloadAction} from '@src/utils';
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
});
