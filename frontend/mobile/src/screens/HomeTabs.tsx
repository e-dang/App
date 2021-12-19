import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Home, Settings, WorkoutStackScreen, ExerciseStackScreen} from './index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';

export type HomeTabsParamList = {
    workouts: undefined;
    exercises: undefined;
    _home: undefined;
    settings: undefined;
};

const HomeTabs = createBottomTabNavigator<HomeTabsParamList>();

export const HomeTabsScreen = () => {
    const {t} = useTranslation();

    return (
        <HomeTabs.Navigator initialRouteName="_home" screenOptions={{headerShown: false}}>
            <HomeTabs.Screen
                name="workouts"
                component={WorkoutStackScreen}
                options={{
                    tabBarTestID: 'navWorkouts',
                    tabBarLabel: t('workouts'),
                    tabBarIcon: ({color, size}) => <Icon name={'weight-lifter'} size={size} color={color} />,
                }}
            />
            <HomeTabs.Screen
                name="exercises"
                component={ExerciseStackScreen}
                options={{
                    tabBarTestID: 'navExercises',
                    tabBarLabel: t('exercises'),
                    tabBarIcon: ({color, size}) => <Icon name={'weight'} size={size} color={color} />,
                }}
            />
            <HomeTabs.Screen
                name="_home"
                component={Home}
                options={{
                    tabBarTestID: 'navHome',
                    tabBarLabel: t('home'),
                    tabBarIcon: ({focused, color, size}) => (
                        <Icon name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                    ),
                }}
            />
            <HomeTabs.Screen
                name="settings"
                component={Settings}
                options={{
                    tabBarTestID: 'navSettings',
                    tabBarLabel: t('settings'),
                    tabBarIcon: ({focused, color, size}) => (
                        <Icon name={focused ? 'cog' : 'cog-outline'} size={size} color={color} />
                    ),
                }}
            />
        </HomeTabs.Navigator>
    );
};
