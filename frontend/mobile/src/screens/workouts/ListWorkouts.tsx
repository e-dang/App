import React, {FC} from 'react';
import {useListWorkoutsQuery} from '@api/workoutApi';
import {Header, Screen} from '@components';
import {useSelector} from '@hooks';
import {selectAuthUserId} from '@selectors';
import {Box, Button, Center, FlatList, Heading, Spinner, Text} from 'native-base';
// import { useNavigation } from '@react-navigation/native';

// export type WorkoutNavProps = StackNagivationProp<>
export const WorkoutScreen: FC = ({children}) => {
    // const navigation = useNavigation();
    return (
        <>
            <Header />
            <Screen testID="workoutScreen">
                <Center flex={4} justifyContent="flex-start">
                    <Heading>Workouts</Heading>
                </Center>
                <Center flex={3}>{children}</Center>
                <Button
                    testID="createWorkoutBtn"
                    variant="solid"
                    colorScheme="primary"
                    borderRadius={100}
                    onPress={() => null}>
                    Create Workout
                </Button>
            </Screen>
        </>
    );
};

export function ListWorkoutsScreen() {
    const authUserId = useSelector(selectAuthUserId) as string;
    const {data = {data: []}, isLoading} = useListWorkoutsQuery(authUserId);

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
