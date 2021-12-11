import React from 'react';
import {Header, Screen} from '@components';
import {Center, Text} from 'native-base';

export function CreateWorkoutScreen() {
    return (
        <>
            <Header />
            <Screen testID="createWorkoutRootScreen">
                <Center>
                    <Text>Some text</Text>
                </Center>
            </Screen>
        </>
    );
}
