import React, {useState} from 'react';
import {BackButton, BasicButton, Header, HeaderButton, NameInput, Screen} from '@components';
import {Box, Center, Heading, VStack, Icon as NBIcon, TextArea} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {WorkoutStackParamList} from '.';
import {CreateWorkoutRequest, useCreateWorkoutMutation} from '@api';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {AppStackParamList} from '@screens/AppStack';

export type CreateWorkoutNavProps = StackNavigationProp<WorkoutStackParamList & AppStackParamList, 'createWorkout'>;

export function CreateWorkoutScreen() {
    const navigation = useNavigation<CreateWorkoutNavProps>();
    const [createWorkout] = useCreateWorkoutMutation();
    const [workoutForm, setWorkoutForm] = useState<CreateWorkoutRequest>({name: ''});

    const handleBack = () => {
        navigation.navigate('listWorkouts');
    };

    const handleDone = () => {
        createWorkout(workoutForm);
        navigation.navigate('listWorkouts');
    };

    const handleAddExercises = () => {
        navigation.push('workoutAddExercises');
    };

    return (
        <Screen testID="createWorkoutScreen">
            <Header
                leftContent={<BackButton onPress={handleBack}>Back</BackButton>}
                rightContent={
                    <HeaderButton testID="doneBtn" onPress={handleDone}>
                        Done
                    </HeaderButton>
                }
            />
            <VStack space={2}>
                <Box>
                    <Heading>New Workout</Heading>
                </Box>
                <Center>
                    <NameInput
                        onChangeText={(value) => setWorkoutForm({...workoutForm, name: value})}
                        value={workoutForm.name}
                    />
                </Center>
                <Box>
                    <TextArea testID="noteInput" onChangeText={() => null} placeholder={'Notes...'} />
                </Box>
                <Center>
                    <BasicButton startIcon={<NBIcon as={Icon} name="plus" size={5} />} onPress={handleAddExercises}>
                        Add Exercise
                    </BasicButton>
                </Center>
            </VStack>
        </Screen>
    );
}
