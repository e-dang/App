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
        await expect(element(by.id('workoutScreen'))).toBeVisible();

        // they see a list of workouts and a button to add a workout
        const workoutsList = element(by.id('workoutList'));
        const createWorkoutBtn = element(by.id('createWorkoutBtn'));
        await expect(workoutsList).toBeVisible();
        await expect(createWorkoutBtn).toBeVisible();

        // the user taps the add workout button and is taken to the create workout flow screen
        await createWorkoutBtn.tap();
        const createWorkoutFlowScreen = element(by.id('createWorkoutScreen'));
        await expect(createWorkoutFlowScreen).toBeVisible();
    });
});
