import React, {memo} from 'react';
import {Screen} from '@components';
import {Button, Center, Heading, VStack} from 'native-base';
import {useDispatch, useSelector} from '@hooks';
import {selectAuthToken} from '@selectors';
import {signOut} from '@store';
import {useSignOutMutation} from '@api';

function SettingsScreen() {
    const authToken = useSelector(selectAuthToken);
    const dispatch = useDispatch();
    const [callSignOut] = useSignOutMutation();

    const handleSignOut = async () => {
        if (authToken) {
            await callSignOut();
            dispatch(signOut());
        }
    };

    return (
        <Screen testID="settingsScreen">
            <VStack space={2}>
                <Center>
                    <Heading>Settings</Heading>
                </Center>
                <Center>
                    <Button
                        testID="signOutBtn"
                        variant="outline"
                        colorScheme="secondary"
                        borderRadius={100}
                        width="90%"
                        onPress={handleSignOut}>
                        Sign Out
                    </Button>
                </Center>
            </VStack>
        </Screen>
    );
}

export const Settings = memo(SettingsScreen);
