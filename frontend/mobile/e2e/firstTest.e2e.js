describe('Auth flow', () => {
    beforeAll(async () => {
        await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    test('Register screen should have an name, email, password text input and a sign up button', async () => {
        await expect(element(by.id('nameInput'))).toBeVisible();
        await expect(element(by.id('emailInput'))).toBeVisible();
        await expect(element(by.id('passwordInput'))).toBeVisible();
        await expect(element(by.id('signUpBtn'))).toBeVisible();
    });

    test('When a user successfully registers they arent taken to the home screen', async () => {
        const name = 'Test User';
        const email = 'demo@example.com';
        const password = 'mytestpassword123';

        // the user enters their name, email, and password
        await element(by.id('nameInput')).typeText(name);
        await element(by.id('emailInput')).typeText(email);
        await element(by.id('passwordInput')).typeText(password);

        await expect(element(by.id('nameInput'))).toHaveText(name);
        await expect(element(by.id('emailInput'))).toHaveText(email);
        await expect(element(by.id('passwordInput'))).toHaveText(password);

        // the user then hits the Sign Up button
        await element(by.id('signUpBtn')).tap();

        // they see a loading icon appear
        await waitFor(element(by.id('loadingModal')))
            .toBeVisible()
            .withTimeout(2000);

        // the registration is successful, and they are taken to the home page
        await waitFor(element(by.id('home')))
            .toBeVisible()
            .withTimeout(2000);
    });
});
