import React, {useCallback} from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {useTranslation} from "react-i18next";
import {Home} from "./Home";
import {WorkoutStackScreen} from "./workouts";
import {ExerciseStackScreen} from "./exercises";
import {Settings} from "./Settings";

export type HomeTabsParamList = {
  workouts: undefined;
  exercises: undefined;
  _home: undefined;
  settings: undefined;
};

const HomeTabs = createBottomTabNavigator<HomeTabsParamList>();

interface IconProps {
  focused: boolean;
  color: string;
  size: number;
}

export const HomeTabsScreen = () => {
  const {t} = useTranslation();
  const workoutsIcon = useCallback(
    ({color, size}: IconProps) => <Icon name="weight-lifter" size={size} color={color} />,
    [],
  );

  const exercisesIcon = useCallback(({color, size}: IconProps) => <Icon name="weight" size={size} color={color} />, []);

  const homeIcon = useCallback(
    ({focused, color, size}: IconProps) => <Icon name={focused ? "home" : "home-outline"} size={size} color={color} />,
    [],
  );

  const settingsIcon = useCallback(
    ({focused, color, size}: IconProps) => <Icon name={focused ? "cog" : "cog-outline"} size={size} color={color} />,
    [],
  );

  return (
    <HomeTabs.Navigator initialRouteName="_home" screenOptions={{headerShown: false}}>
      <HomeTabs.Screen
        name="workouts"
        component={WorkoutStackScreen}
        options={{
          tabBarTestID: "navWorkouts",
          tabBarLabel: t("workouts"),
          tabBarIcon: workoutsIcon,
        }}
      />
      <HomeTabs.Screen
        name="exercises"
        component={ExerciseStackScreen}
        options={{
          tabBarTestID: "navExercises",
          tabBarLabel: t("exercises"),
          tabBarIcon: exercisesIcon,
        }}
      />
      <HomeTabs.Screen
        name="_home"
        component={Home}
        options={{
          tabBarTestID: "navHome",
          tabBarLabel: t("home"),
          tabBarIcon: homeIcon,
        }}
      />
      <HomeTabs.Screen
        name="settings"
        component={Settings}
        options={{
          tabBarTestID: "navSettings",
          tabBarLabel: t("settings"),
          tabBarIcon: settingsIcon,
        }}
      />
    </HomeTabs.Navigator>
  );
};
