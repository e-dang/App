import {getActionName} from '@src/utils';

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
});
