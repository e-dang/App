import React, {FC} from 'react';
import {Screen} from '@components';
import {Box, Button, Center, Heading, Spinner, Text, VStack} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {ExerciseStackParamList} from '.';
import {FlatList} from 'react-native-gesture-handler';
import {useListExercisesQuery} from '@api';

type ListExerciseNavProps = StackNavigationProp<ExerciseStackParamList, 'listExercises'>;

const ExerciseScreen: FC = ({children}) => {
    const navigation = useNavigation<ListExerciseNavProps>();

    const handleCreateExercise = () => {
        navigation.navigate('createExercise');
    };

    return (
        <Screen testID="listExercisesScreen">
            <VStack space={2}>
                <Center justifyContent="flex-start">
                    <Heading>Exercises</Heading>
                </Center>
                <Center>{children}</Center>
                <Button
                    testID="createExerciseBtn"
                    variant="solid"
                    colorScheme="primary"
                    borderRadius={100}
                    onPress={handleCreateExercise}>
                    Create Exercise
                </Button>
            </VStack>
        </Screen>
    );
};

export function ListExerciseScreen() {
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
