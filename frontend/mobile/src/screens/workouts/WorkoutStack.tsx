import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {CreateWorkoutScreen} from './CreateWorkoutRoot';
import {ListWorkoutsScreen} from './ListWorkouts';

type WorkoutStackParamList = {
    listWorkouts: undefined;
    createWorkout: undefined;
};

const WorkoutStack = createStackNavigator<WorkoutStackParamList>();

export function WorkoutStackScreen() {
    return (
        <WorkoutStack.Navigator initialRouteName="listWorkouts">
            <WorkoutStack.Screen name="listWorkouts" component={ListWorkoutsScreen} />
            <WorkoutStack.Screen name="createWorkout" component={CreateWorkoutScreen} />
        </WorkoutStack.Navigator>
    );
}
