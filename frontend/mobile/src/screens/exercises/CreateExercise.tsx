import {CreateExerciseRequest, useCreateExerciseMutation} from '@api';
import {BackButton, Header, NameInput, Screen} from '@components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button, Center} from 'native-base';
import React, {useState} from 'react';
import {ExerciseStackParamList} from '.';

type CreateExerciseNavProps = StackNavigationProp<ExerciseStackParamList, 'createExercise'>;

export function CreateExerciseScreen() {
    const navigation = useNavigation<CreateExerciseNavProps>();
    const [createExercise] = useCreateExerciseMutation();
    const [exerciseForm, setExerciseForm] = useState<CreateExerciseRequest>({name: ''});

    const handleBack = () => {
        navigation.navigate('listExercises');
    };

    const handleDone = () => {
        createExercise(exerciseForm);
        navigation.navigate('listExercises');
    };

    return (
        <>
            <Header
                leftContent={<BackButton testID="backBtn" onPress={handleBack} />}
                rightContent={
                    <Button testID="doneBtn" colorScheme="primary" variant="ghost" onPress={handleDone}>
                        Done
                    </Button>
                }
            />
            <Screen>
                <Center>
                    <NameInput
                        onChangeText={(value) => setExerciseForm({...exerciseForm, name: value})}
                        value={exerciseForm.name}
                    />
                </Center>
            </Screen>
        </>
    );
}
