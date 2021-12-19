import React, {useState} from 'react';
import {BackButton, Header, HeaderButton, NameInput, Screen} from '@components';
import {Box, Center, Heading, VStack} from 'native-base';
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
        <Screen testID="createWorkoutScreen">
            <Header
                leftContent={<BackButton onPress={handleBack}>Back</BackButton>}
                rightContent={
                    <HeaderButton testID="doneBtn" colorScheme="primary" variant="ghost" onPress={handleDone}>
                        Done
                    </HeaderButton>
                }
            />
            <VStack space={2}>
                <Box>
                    <Heading>New Workout</Heading>
                </Box>
                <Center>
                    <NameInput onChangeText={(value) => setName(value)} value={name} />
                </Center>
            </VStack>
        </Screen>
    );
}
