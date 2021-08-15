import React, {memo} from 'react';
import {Header, Screen} from '@components';
import {Button, Center, Heading, Stack} from 'native-base';
import {useDispatch} from 'react-redux';
import {signOut} from '@actions';

function SettingsScreen() {
    const dispatch = useDispatch();

    const handleSignOut = () => {
        dispatch(signOut());
    };

    return (
        <>
            <Header />
            <Screen testID="settingsScreen">
                <Center flex={4}>
                    <Heading>Settings</Heading>
                </Center>
                <Center flex={3}>
                    <Stack direction="column" space={2} width="90%">
                        <Button
                            testID="signOutBtn"
                            variant="outline"
                            colorScheme="secondary"
                            borderRadius={100}
                            onPress={handleSignOut}>
                            Sign Out
                        </Button>
                    </Stack>
                </Center>
            </Screen>
        </>
    );
}

export const Settings = memo(SettingsScreen);
