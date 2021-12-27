import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {CreateExerciseScreen} from "./CreateExercise";
import {ListExerciseScreen} from "./ListExercises";

export type ExerciseStackParamList = {
  listExercises: undefined;
  createExercise: undefined;
};

const ExerciseStack = createStackNavigator<ExerciseStackParamList>();

export const ExerciseStackScreen = () => {
  return (
    <ExerciseStack.Navigator initialRouteName="listExercises" screenOptions={{headerShown: false}}>
      <ExerciseStack.Screen name="listExercises" component={ListExerciseScreen} />
      <ExerciseStack.Screen name="createExercise" component={CreateExerciseScreen} />
    </ExerciseStack.Navigator>
  );
};
