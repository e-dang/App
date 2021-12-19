import {device, element, by, expect} from 'detox';
import {createUser, signIn} from './utils';

describe('create workout flow', () => {
    let email: string;
    let password: string;

    beforeEach(async () => {
        await device.reloadReactNative();
        ({email, password} = await createUser());
    });

    test('user can create a new workout', async () => {
        // the user signs in and goes to the workout screen
        await signIn({email, password});
        await element(by.id('navWorkouts')).tap();
        const listWorkoutsScreen = element(by.id('listWorkoutsScreen'));
        await expect(listWorkoutsScreen).toBeVisible();

        // they see a list of workouts and a button to add a workout
        const workoutsList = element(by.id('workoutList'));
        const createWorkoutBtn = element(by.id('createWorkoutBtn'));
        await expect(workoutsList).toBeVisible();
        await expect(createWorkoutBtn).toBeVisible();

        // the user taps the add workout button and is taken to the create workout screen
        await createWorkoutBtn.tap();
        const createWorkoutFlowScreen = element(by.id('createWorkoutScreen'));
        await expect(createWorkoutFlowScreen).toBeVisible();

        // the user then enters the name of the workout into the name input and taps the done button
        const workoutName = 'My Test Workout';
        const workoutNameInput = element(by.id('nameInput'));
        const doneBtn = element(by.id('doneBtn'));

        await expect(workoutNameInput).toBeVisible();
        await expect(doneBtn).toBeVisible();

        workoutNameInput.typeText(workoutName);
        await expect(workoutNameInput).toHaveText(workoutName);

        await doneBtn.tap();

        // the user is taken back to the workout list screen where they see their new workout
        await expect(listWorkoutsScreen).toBeVisible();
        await expect(element(by.text(workoutName))).toBeVisible();
    });
});
