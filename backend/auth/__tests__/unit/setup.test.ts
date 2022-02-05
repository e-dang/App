/**
 * Test Groups
 *
 * @group unit
 * @group setup
 */

describe("setup", () => {
  test("NODE_ENV is equal to test or ci", () => {
    const isTestOrCi = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "ci";
    expect(isTestOrCi).toBe(true);
  });
});
