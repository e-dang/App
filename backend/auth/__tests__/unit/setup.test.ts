/**
 * Auth APIs
 *
 * @group unit
 * @group auth
 */

describe('setup', () => {
    test('NODE_ENV is equal to test or ci', async () => {
        const isTestOrCi = process.env.NODE_ENV == 'test' || process.env.NODE_ENV == 'ci';
        expect(isTestOrCi).toBe(true);
    });
});