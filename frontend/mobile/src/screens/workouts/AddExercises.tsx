import React, {FC} from 'react';
import {Header, HeaderButton, Screen} from '@components';
import {Box, Center, Heading, Spinner, Text, VStack} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList} from 'react-native-gesture-handler';
import {useListExercisesQuery} from '@api';
import {WorkoutStackParamList} from '.';
import {CancelButton} from '@components/basic/CancelButton';
import {AppStackParamList} from '@screens/AppStack';

type AddExercisesNavProps = StackNavigationProp<WorkoutStackParamList & AppStackParamList, 'workoutAddExercises'>;

const ExerciseScreen: FC = ({children}) => {
    const navigation = useNavigation<AddExercisesNavProps>();

    const handleBack = () => {
        navigation.pop();
    };

    const handleAddExercises = () => {
        //     navigation.navigate('createExercise');
    };

    return (
        <Screen testID="listExercisesScreen">
            <Header
                leftContent={<CancelButton onPress={handleBack} />}
                rightContent={<HeaderButton onPress={handleAddExercises}>Add</HeaderButton>}
            />
            <VStack space={2}>
                <Center justifyContent="flex-start">
                    <Heading>Exercises</Heading>
                </Center>
                <Center>{children}</Center>
            </VStack>
        </Screen>
    );
};

export function AddExercisesScreen() {
    const {data = {data: []}, isLoading} = useListExercisesQuery();

    if (isLoading) {
        return (
            <ExerciseScreen>
                <Spinner animating={isLoading} accessibilityLabel="Loading indicator" />
            </ExerciseScreen>
        );
    }

    return (
        <ExerciseScreen>
            <FlatList
                testID="exerciseList"
                data={data.data}
                ListEmptyComponent={<Text>You Don't Have Any Exercises...</Text>}
                renderItem={({item}) => (
                    <Box>
                        <Text>{item.name}</Text>
                    </Box>
                )}
            />
        </ExerciseScreen>
    );
}
