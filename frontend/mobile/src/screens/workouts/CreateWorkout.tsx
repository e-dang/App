import React, {useState} from 'react';
import {BackButton, Header, NameInput, Screen} from '@components';
import {Button, Center} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {WorkoutStackParamList} from '.';
import {useCreateWorkoutMutation} from '@api';

export type CreateWorkoutNavProps = StackNavigationProp<WorkoutStackParamList, 'createWorkout'>;

export function CreateWorkoutScreen() {
    const navigation = useNavigation<CreateWorkoutNavProps>();
    const [createWorkout] = useCreateWorkoutMutation();
    const [name, setName] = useState<string>('');

    const handleBack = () => {
        navigation.navigate('listWorkouts');
    };

    const handleDone = () => {
        createWorkout({name});
        navigation.navigate('listWorkouts');
    };

    return (
        <>
            <Header
                leftContent={
                    <BackButton testID="backBtn" onPress={handleBack}>
                        Back
                    </BackButton>
                }
                rightContent={
                    <Button testID="doneBtn" colorScheme="primary" variant="ghost" onPress={handleDone}>
                        Done
                    </Button>
                }
            />
            <Screen testID="createWorkoutScreen">
                <Center>
                    <NameInput onChangeText={(value) => setName(value)} value={name} />
                </Center>
            </Screen>
        </>
    );
}
