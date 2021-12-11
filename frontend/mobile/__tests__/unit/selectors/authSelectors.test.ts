import {isAuthTokenValid, selectAuthState, selectAuthToken} from '@selectors';
import {RootState} from '@src/store';
import {mock, MockProxy} from 'jest-mock-extended';
import MockDate from 'mockdate';

describe('auth selector tests', () => {
    let rootState: MockProxy<RootState>;

    beforeEach(() => {
        MockDate.reset();
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

    test('isAuthTokenValid returns true if authToken is not expired', async () => {
        const expDate = 1629577338; // the expiration time of the token
        MockDate.set(expDate - 5);
        rootState.auth.token = {
            accessToken:
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjI5NTc3MzM4LCJqdGkiOiIzMmZmZjliODFlZTA0YjY4ODk0MmIwZjQ2NjY5ZjBmMCIsInVzZXJfaWQiOjd9.-gGrjt78TsZW4aT0-_YCOYxkDTvykeuA4o1OIyfgnz8',
            refreshToken:
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYyOTY2MzQzOCwianRpIjoiNzZiOGNkZjNjNzM4NGJlOGFmY2QzM2M3MmMwOWYzM2QiLCJ1c2VyX2lkIjo3fQ.9QZ9-B3QzqAtfttbgWVrtP9rxxvhhl-bpHoi6ITDF-w',
        };

        const retVal = isAuthTokenValid(rootState);

        expect(retVal).toBe(true);
    });

    test('isAuthTokenValid returns false if authToken is null', async () => {
        rootState.auth.token = null;

        const retVal = isAuthTokenValid(rootState);

        expect(retVal).toBe(false);
    });

    test('isAuthTokenValid returns false if authToken is expired', async () => {
        rootState.auth.token = {
            accessToken:
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjI5NTc3MzM4LCJqdGkiOiIzMmZmZjliODFlZTA0YjY4ODk0MmIwZjQ2NjY5ZjBmMCIsInVzZXJfaWQiOjd9.-gGrjt78TsZW4aT0-_YCOYxkDTvykeuA4o1OIyfgnz8',
            refreshToken:
                'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYyOTY2MzQzOCwianRpIjoiNzZiOGNkZjNjNzM4NGJlOGFmY2QzM2M3MmMwOWYzM2QiLCJ1c2VyX2lkIjo3fQ.9QZ9-B3QzqAtfttbgWVrtP9rxxvhhl-bpHoi6ITDF-w',
        };

        const retVal = isAuthTokenValid(rootState);

        expect(retVal).toBe(false);
    });
});