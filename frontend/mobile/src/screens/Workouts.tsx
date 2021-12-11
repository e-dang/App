import {Header, Screen} from '@components';
import {Center, Heading, Text} from 'native-base';
import React from 'react';

export function Workouts() {
    return (
        <>
            <Header />
            <Screen testID="workoutScreen">
                <Center flex={4} justifyContent="flex-start">
                    <Heading>Workouts</Heading>
                </Center>
                <Center flex={3}>
                    <Text>These are your workouts</Text>
                </Center>
            </Screen>
        </>
    );
}
