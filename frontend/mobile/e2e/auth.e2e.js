import {v4 as uuidv4} from 'uuid';
import axios from 'axios';

const MAILHOG_URL = 'https://mail.dev.erickdang.com/api/v2/search';

function generateEmail() {
    return `${uuidv4()}@demo.com`;
}

async function createUser(name, email, password) {
    return await axios.post('https://dev.erickdang.com/api/v1/registration/', {
        name,
        email,
        password1: password,
        password2: password,
    });
}

async function signOut() {
    await element(by.id('masterSignOut')).tap();
}

async function checkForEmail(to, predicate) {
    const messages = await axios.get(MAILHOG_URL, {
        params: {
            kind: 'to',
            query: to,
        },
    });

    messages.data.items.some(predicate);
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
        await signOut();
    });

    test('email signup flow', async () => {
        // the user opens the app and sees an option to signUp via email and clicks it
        await expect(element(by.id('welcomeScreen'))).toBeVisible();
        const signUpBtn = element(by.id('emailSignUpBtn'));
        await expect(signUpBtn).toBeVisible();
        await signUpBtn.tap();

        // they are taken to the email sign up screen where they see sees text input fields for name, email, and
        // password
        await expect(element(by.id('emailSignUpScreen'))).toBeVisible();
        const nameInput = element(by.id('nameInput'));
        const emailInput = element(by.id('emailInput'));
        const passwordInput = element(by.id('passwordInput'));
        await expect(nameInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();

        // they enter their info
        await nameInput.typeText(name);
        await emailInput.typeText(email);
        await passwordInput.typeText(password);
        await expect(nameInput).toHaveText(name);
        await expect(emailInput).toHaveText(email);
        await expect(passwordInput).toHaveText(password);

        // the user then hits the Sign Up button
        await element(by.id('signUpBtn')).tap();

        // the registration is successful, and they are taken to the home page
        await expect(element(by.id('homeScreen'))).toBeVisible();
    });

    test('sign in and sign out flow', async () => {
        // an existing user opens the app but is not logged in
        await createUser(name, email, password);
        const welcomeScreen = element(by.id('welcomeScreen'));
        await expect(welcomeScreen).toBeVisible();

        // they click on the sign in button and are taken to the SignIn screen
        await element(by.id('signInBtn')).tap();
        await expect(element(by.id('signInScreen'))).toBeVisible();

        // they are prompted for their email and password
        const emailInput = element(by.id('emailInput'));
        const passwordInput = element(by.id('passwordInput'));
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();

        // they enter their valid credentials
        await emailInput.typeText(email);
        await passwordInput.typeText(password);
        await expect(emailInput).toHaveText(email);
        await expect(passwordInput).toHaveText(password);

        // the user then hits the sign in button and is taken to the Home screen
        await element(by.id('signInBtn')).tap();
        await expect(element(by.id('homeScreen'))).toBeVisible();

        // they navigate to settings and then click signOut
        await element(by.id('navSettings')).tap();
        await expect(element(by.id('settingsScreen'))).toBeVisible();
        const signOutBtn = element(by.id('signOutBtn'));
        await expect(signOutBtn).toBeVisible();
        await signOutBtn.tap();

        // they are then taken back to the welcome screen
        await expect(welcomeScreen).toBeVisible();
    });

    test('forgot password flow', async () => {
        // an existing user is on the welcome screen and navigates to the sign in screen
        await createUser(name, email, password);
        await expect(element(by.id('welcomeScreen'))).toBeVisible();
        await element(by.id('signInBtn')).tap();

        // they click on the sign in button and are taken to the SignIn screen
        const signInScreen = element(by.id('signInScreen'));
        await expect(signInScreen).toBeVisible();

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

        // they check their email and see the email to reset their password
        checkForEmail(email, (msg) => {
            if (msg.Content.Headers.Subject[0].includes('Password Reset')) {
                return true;
            }

            return false;
        });
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

        // they then go to the sign up with email screen again
        await element(by.id('emailSignUpBtn')).tap();
        await expect(emailSignUpScreen).toBeVisible();

        // they navigate to the sign in screen
        await element(by.id('signInBtn')).tap();
        await expect(signInScreen).toBeVisible();

        // they navigate back to the sign up with email screen
        await element(by.id('signUpBtn')).tap();
        await expect(emailSignUpScreen).toBeVisible();
    });
});
