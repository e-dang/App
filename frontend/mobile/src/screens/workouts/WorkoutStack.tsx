import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {Exercise} from "@entities";
import {CreateWorkoutScreen} from "./CreateWorkout";
import {ListWorkoutsScreen} from "./ListWorkouts";

export type WorkoutStackParamList = {
  listWorkouts: undefined;
  createWorkout: {selectedExercises: Exercise[]} | undefined;
};

const WorkoutStack = createStackNavigator<WorkoutStackParamList>();

export const WorkoutStackScreen = () => {
  return (
    <WorkoutStack.Navigator initialRouteName="listWorkouts" screenOptions={{headerShown: false}}>
      <WorkoutStack.Screen name="listWorkouts" component={ListWorkoutsScreen} />
      <WorkoutStack.Screen name="createWorkout" component={CreateWorkoutScreen} />
    </WorkoutStack.Navigator>
  );
};
