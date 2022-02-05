import {device, element, by, expect} from "detox";
import {createUser, signIn} from "./utils";

describe("create workout flow", () => {
  let email: string;
  let password: string;

  beforeEach(async () => {
    await device.reloadReactNative();
    ({email, password} = await createUser());
  });

  test("user can create new exercises", async () => {
    // the user signs in and goes to the workout screen
    await signIn({email, password});
    await element(by.id("navExercises")).tap();
    const listExercisesScreen = element(by.id("listExercisesScreen"));
    await expect(listExercisesScreen).toBeVisible();

    // they see a list of exercises and a button to add an exercise
    const exerciseList = element(by.id("exerciseList"));
    const createExerciseBtn = element(by.id("createExerciseBtn"));
    await expect(exerciseList).toBeVisible();
    await expect(createExerciseBtn).toBeVisible();

    // the user taps the create exercise button and is taken to the create exercise screen
    await createExerciseBtn.tap();
    const createExerciseScreen = element(by.id("createExerciseScreen"));
    await expect(createExerciseScreen).toBeVisible();

    // the user then enters the name of the exercise into the name input and taps the done button
    const exerciseName = "Barbell Bench Press";
    const exerciseNameInput = element(by.id("nameInput"));
    const doneBtn = element(by.id("doneBtn"));

    await expect(exerciseNameInput).toBeVisible();
    await expect(doneBtn).toBeVisible();

    await exerciseNameInput.typeText(exerciseName);
    await expect(exerciseNameInput).toHaveText(exerciseName);

    await doneBtn.tap();

    // the user is taken back to the exercise list screen where they see their new exercise
    await expect(listExercisesScreen).toBeVisible();
    await expect(element(by.text(exerciseName))).toBeVisible();
  });
});
