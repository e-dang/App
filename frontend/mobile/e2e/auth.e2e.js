import {v4 as uuidv4} from 'uuid';

const TIMEOUT = 2000;

function generateEmail() {
    return `${uuidv4()}@demo.com`;
}

describe('Auth flow', () => {
    let name;
    let email;
    let password;

    beforeAll(async () => {
        // await device.launchApp();
    });

    beforeEach(async () => {
        await device.reloadReactNative();
        name = 'Test User';
        email = generateEmail();
        password = 'mytestpassword123';
    });

    test('email signup flow', async () => {
        // the user opens the app and sees an option to register via email and clicks it
        await waitFor(element(by.id('emailSignUpBtn')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await element(by.id('emailSignUpBtn')).tap();

        // the user sees text input fields for name, email, and password and proceeds to enter their information
        await waitFor(element(by.id('nameInput')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await waitFor(element(by.id('emailInput')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await waitFor(element(by.id('passwordInput')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

        await element(by.id('nameInput')).typeText(name);
        await element(by.id('emailInput')).typeText(email);
        await element(by.id('passwordInput')).typeText(password);

        await expect(element(by.id('nameInput'))).toHaveText(name);
        await expect(element(by.id('emailInput'))).toHaveText(email);
        await expect(element(by.id('passwordInput'))).toHaveText(password);

        // the user then hits the Sign Up button
        await element(by.id('signUpBtn')).tap();

        // the registration is successful, and they are taken to the home page
        await waitFor(element(by.id('home')))
            .toBeVisible()
            .withTimeout(10000);
    });
});
