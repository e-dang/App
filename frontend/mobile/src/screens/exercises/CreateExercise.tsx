import {CreateExerciseRequest, useCreateExerciseMutation} from '@api';
import {BackButton, Header, HeaderButton, NameInput, Screen} from '@components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Center} from 'native-base';
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
        <Screen testID="createExerciseScreen">
            <Header
                leftContent={<BackButton onPress={handleBack}>Back</BackButton>}
                rightContent={
                    <HeaderButton testID="doneBtn" colorScheme="primary" variant="ghost" onPress={handleDone}>
                        Done
                    </HeaderButton>
                }
            />
            <Center>
                <NameInput
                    onChangeText={(value) => setExerciseForm({...exerciseForm, name: value})}
                    value={exerciseForm.name}
                />
            </Center>
        </Screen>
    );
}
