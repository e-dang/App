import React, {memo} from 'react';
import {Header, Screen} from '@components';
import {Button, Center, Heading, Stack} from 'native-base';
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
            await callSignOut({refresh: authToken.refreshToken});
            dispatch(signOut());
        }
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
