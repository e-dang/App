import React from "react";
import {createStackNavigator} from "@react-navigation/stack";
import {HomeTabsScreen} from "./HomeTabs";
import {AddExercisesScreen} from "./workouts";

export type AppStackParamList = {
  home: undefined;
  workoutAddExercises: undefined;
};

const AppStack = createStackNavigator<AppStackParamList>();

export const AppStackScreen = () => {
  return (
    <AppStack.Navigator initialRouteName="home" screenOptions={{headerShown: false}}>
      <AppStack.Group>
        <AppStack.Screen name="home" component={HomeTabsScreen} />
      </AppStack.Group>
      <AppStack.Group screenOptions={{presentation: "modal"}}>
        <AppStack.Screen name="workoutAddExercises" component={AddExercisesScreen} />
      </AppStack.Group>
    </AppStack.Navigator>
  );
};
