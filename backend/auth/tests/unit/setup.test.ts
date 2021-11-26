/**
 * Auth APIs
 *
 * @group unit
 * @group auth
 */

describe('setup', () => {
    test('NODE_ENV is equal to test', async () => {
        expect(process.env.NODE_ENV).toEqual('test');
    });
});
