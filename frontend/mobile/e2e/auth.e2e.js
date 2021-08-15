import {AuthApi} from '@api';
import Client from '@api/client';
import {v4 as uuidv4} from 'uuid';

const TIMEOUT = 2000;

function generateEmail() {
    return `${uuidv4()}@demo.com`;
}

async function createUser(name, email, password) {
    return await AuthApi.register({name, email, password1: password, password2: password});
}

async function logout() {
    await element(by.id('masterLogout')).tap();
    Client.clearAuthToken();
}

describe('Auth flow', () => {
    let name;
    let email;
    let password;

    beforeEach(async () => {
        await device.reloadReactNative();
        name = 'Test User';
        email = generateEmail();
        password = 'mytestpassword123';
    });

    afterEach(async () => {
        await logout();
    });

    test('email signup flow', async () => {
        // the user opens the app and sees an option to register via email and clicks it
        await waitFor(element(by.id('welcomeScreen')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await waitFor(element(by.id('emailSignUpBtn')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await element(by.id('emailSignUpBtn')).tap();
        await waitFor(element(by.id('emailSignUpScreen')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

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
        await waitFor(element(by.id('homeScreen')))
            .toBeVisible()
            .withTimeout(10000);
    });

    test('sign in flow', async () => {
        // an existing user opens the app but is not logged in
        await createUser(name, email, password);
        await waitFor(element(by.id('welcomeScreen')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

        // they click on the sign in button and are taken to the SignIn screen
        await element(by.id('signInBtn')).tap();
        await waitFor(element(by.id('signInScreen')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

        // they are prompted for their email and password
        await waitFor(element(by.id('emailInput')))
            .toBeVisible()
            .withTimeout(TIMEOUT);
        await waitFor(element(by.id('passwordInput')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

        // they enter their valid credentials
        await element(by.id('emailInput')).typeText(email);
        await element(by.id('passwordInput')).typeText(password);
        await expect(element(by.id('emailInput'))).toHaveText(email);
        await expect(element(by.id('passwordInput'))).toHaveText(password);

        // the user then hits the sign in button and is taken to the Home screen
        await element(by.id('signInBtn')).tap();

        await waitFor(element(by.id('homeScreen')))
            .toBeVisible()
            .withTimeout(10000);
    });

    test('forgot password flow', async () => {
        // an existing user is on the welcome screen and navigates to the sign in screen
        await createUser(name, email, password);
        await waitFor(element(by.id('welcomeScreen')))
            .toBeVisible()
            .withTimeout(TIMEOUT);

        // they click on the sign in button and are taken to the SignIn screen
        const signInScreen = element(by.id('signInScreen'));
        await element(by.id('signInBtn')).tap();
        await waitFor(signInScreen).toBeVisible().withTimeout(TIMEOUT);

        // they realize that they forgot their password and click the forgot password link and
        // are navigated to the forgot password screen
        await element(by.id('forgotPasswordBtn')).tap();
        await expect(element(by.id('forgotPasswordScreen'))).toBeVisible();

        // the screen asks them for their email address which they type in
        const emailInput = element(by.id('emailInput'));
        await expect(emailInput).toBeVisible();
        await emailInput.typeText(email);
        await expect(emailInput).toHaveText(email);

        // they then hit the submit and a modal appears telling them an email has been sent to the email
        // address
        await element(by.id('submitBtn')).tap();
        await expect(element(by.id('emailSentNotice'))).toBeVisible();

        // they click ok and are navigated back to the signIn screen
        await element(by.id('okBtn')).tap();
        await expect(signInScreen).toBeVisible();
    });

    test('the user can navigate back and forth between auth pages', async () => {
        // An unauthenticated user opens the app
        const welcomeScreen = element(by.id('welcomeScreen'));
        await expect(welcomeScreen).toBeVisible();

        // they navigate to the sign up with email screen
        const emailSignUpScreen = element(by.id('emailSignUpScreen'));
        await element(by.id('emailSignUpBtn')).tap();
        await expect(emailSignUpScreen).toBeVisible();

        // they navigate back to the welcome screen
        await element(by.id('backBtn')).tap();
        await expect(welcomeScreen).toBeVisible();

        // they then navigate to the sign in screen
        const signInScreen = element(by.id('signInScreen'));
        await element(by.id('signInBtn')).tap();
        await expect(signInScreen).toBeVisible();

        // then navigate to the forgot password screen
        const forgotPasswordScreen = element(by.id('forgotPasswordScreen'));
        await element(by.id('forgotPasswordBtn')).tap();
        await expect(forgotPasswordScreen).toBeVisible();

        // they then go back to the sign in screen
        await element(by.id('backBtn')).tap();
        await expect(signInScreen).toBeVisible();

        // they then click the back button and go back to the welcome screen
        await element(by.id('backBtn')).tap();
        await expect(welcomeScreen).toBeVisible();
    });
});
