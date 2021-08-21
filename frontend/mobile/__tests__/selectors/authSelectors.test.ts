import {selectAuthState, selectAuthToken} from '@selectors';
import {RootState} from '@src/store';
import {mock, MockProxy} from 'jest-mock-extended';

describe('auth selector tests', () => {
    let rootState: MockProxy<RootState>;

    beforeEach(() => {
        rootState = mock<RootState>();
    });

    test('selectAuthState returns the auth slice of root state', async () => {
        const retVal = selectAuthState(rootState);

        expect(retVal).toBe(rootState.auth);
    });

    test('selectAuthToken returns the auth token stored in the auth slice of root state', async () => {
        const retVal = selectAuthToken(rootState);

        expect(retVal).toBe(rootState.auth.token);
    });
});
