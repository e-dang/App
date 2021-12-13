import React, {FC} from 'react';
import {useListWorkoutsQuery} from '@api/workoutApi';
import {Header, Screen} from '@components';
import {Box, Button, Center, FlatList, Heading, Spinner, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {WorkoutStackParamList} from './WorkoutStack';
import {StackNavigationProp} from '@react-navigation/stack';

export type ListWorkoutNavProps = StackNavigationProp<WorkoutStackParamList, 'listWorkouts'>;

export const WorkoutScreen: FC = ({children}) => {
    const navigation = useNavigation<ListWorkoutNavProps>();

    const handleCreateWorkout = () => {
        navigation.navigate('createWorkout');
    };

    return (
        <>
            <Header />
            <Screen testID="listWorkoutsScreen">
                <Center flex={4} justifyContent="flex-start">
                    <Heading>Workouts</Heading>
                </Center>
                <Center flex={3}>{children}</Center>
                <Button
                    testID="createWorkoutBtn"
                    variant="solid"
                    colorScheme="primary"
                    borderRadius={100}
                    onPress={handleCreateWorkout}>
                    Create Workout
                </Button>
            </Screen>
        </>
    );
};

export function ListWorkoutsScreen() {
    const {data = {data: []}, isLoading} = useListWorkoutsQuery();

    if (isLoading) {
        return (
            <WorkoutScreen>
                <Spinner animating={isLoading} accessibilityLabel="Loading indicator" />
            </WorkoutScreen>
        );
    }

    return (
        <WorkoutScreen>
            <FlatList
                testID="workoutList"
                data={data.data}
                ListEmptyComponent={<Text>You Don't Have Any Workouts...</Text>}
                renderItem={({item}) => (
                    <Box>
                        <Text>{item.name}</Text>
                    </Box>
                )}
            />
        </WorkoutScreen>
    );
}
