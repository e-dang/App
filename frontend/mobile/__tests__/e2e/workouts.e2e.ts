import {Exercise} from "@entities";
import {device, element, by, expect} from "detox";
import {createExercises, createUser, signIn} from "./utils";

describe("create workout flow", () => {
  let email: string;
  let password: string;
  let accessToken: string;
  let exercises: Partial<Exercise>[];

  beforeEach(async () => {
    await device.reloadReactNative();
    exercises = [{name: "Barbell Bench Press"}, {name: "Dumbbell Bench Press"}];
    ({email, password, accessToken} = await createUser());
    await createExercises(accessToken, exercises);
  });

  test("user can create a new workout", async () => {
    // the user signs in and goes to the workout screen
    await signIn({email, password});
    await element(by.id("navWorkouts")).tap();
    const listWorkoutsScreen = element(by.id("listWorkoutsScreen"));
    await expect(listWorkoutsScreen).toBeVisible();

    // they see a list of workouts and a button to add a workout
    const workoutsList = element(by.id("workoutList"));
    const createWorkoutBtn = element(by.id("createWorkoutBtn"));
    await expect(workoutsList).toBeVisible();
    await expect(createWorkoutBtn).toBeVisible();

    // the user taps the add workout button and is taken to the create workout screen
    await createWorkoutBtn.tap();
    const createWorkoutScreen = element(by.id("createWorkoutScreen"));
    await expect(createWorkoutScreen).toBeVisible();

    // the user then enters the name and description of the workout
    const workoutName = "My Test Workout";
    const workoutNameInput = element(by.id("nameInput"));
    await expect(workoutNameInput).toBeVisible();
    await workoutNameInput.typeText(workoutName);
    await expect(workoutNameInput).toHaveText(workoutName);

    const workoutNotes =
      "This is a test note of a workout that is being used in a test. This note is supposed to be long in order to test that the input can handle a long text input.";
    const workoutNotesInput = element(by.id("noteInput"));
    await expect(workoutNotesInput).toBeVisible();
    await workoutNotesInput.typeText(workoutNotes);
    await expect(workoutNotesInput).toHaveText(workoutNotes);

    // then the user clicks the add exercise button
    const addExerciseBtn = element(by.text("Add Exercise"));
    await expect(addExerciseBtn).toBeVisible();
    await addExerciseBtn.tap();

    // a screen with a list of exercises to select from appear and the user selects multiple exercises
    const addExerciseScreen = element(by.id("addExerciseScreen"));
    await expect(addExerciseScreen).toBeVisible();

    for (const exercise of exercises) {
      const exerciseEle = element(by.text(exercise.name as string));
      await expect(exerciseEle).toBeVisible();
      await exerciseEle.tap();
    }

    // both exercises are now highlighted with a check mark inidicating their selection
    for (const exercise of exercises) {
      const exerciseEle = element(by.label("selectedListItem").withDescendant(by.text(exercise.name as string)));
      await expect(exerciseEle).toExist();
    }

    // they finish their selection and can now see the exercises on the create workout screen
    const finishAddExerciseBtn = element(by.text(`Add (${exercises.length})`));
    await expect(finishAddExerciseBtn).toBeVisible();
    await finishAddExerciseBtn.tap();
    await expect(addExerciseScreen).not.toBeVisible();
    await expect(createWorkoutScreen).toBeVisible();

    for (const exercise of exercises) {
      const exerciseCard = element(by.label("exerciseCard").withDescendant(by.text(exercise.name as string)));
      await expect(exerciseCard).toBeVisible();
    }

    // they save the workout and is taken back to the workout list screen where they see their new workout
    const doneBtn = element(by.text("Save"));
    await expect(doneBtn).toBeVisible();
    await doneBtn.tap();

    await expect(listWorkoutsScreen).toBeVisible();
    await expect(element(by.text(workoutName))).toBeVisible();
  });
});
