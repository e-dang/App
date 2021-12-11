import React from 'react';
import {Header, Screen} from '@components';
import {Center, Text} from 'native-base';

export function CreateWorkoutScreen() {
    return (
        <>
            <Header />
            <Screen testID="createWorkoutScreen">
                <Center>
                    <Text>Some text</Text>
                </Center>
            </Screen>
        </>
    );
}
