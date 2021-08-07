import {PendingState} from '@reducers';
import {getPending} from '@utils';

describe('store utils', () => {
    test('getPending returns the pending prop for the action when the action type property exists on state', () => {
        const actionType = 'TEST_ACTION_TYPE';
        const pending = true;
        const state: PendingState = {
            [actionType]: {
                pending,
            },
        };

        const retVal = getPending(state, actionType);

        expect(retVal).toBe(pending);
    });

    test('getPending returns false when the action type property doesnt exist on the state', () => {
        const actionType = 'TEST_ACTION_TYPE';
        const state: PendingState = {};

        const retVal = getPending(state, actionType);

        expect(retVal).toBe(false);
    });
});
