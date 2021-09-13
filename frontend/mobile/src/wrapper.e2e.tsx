import React from 'react';
import {App as AppBase} from '@src/App';
import {Box, Button} from 'native-base';
import {selectAuthToken} from '@selectors';
import {useDispatch, useSelector} from './hooks';
import {useSignOutMutation, signOut} from '@store/authSlice';

export function App() {
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
        <Box flex={1}>
            <AppBase />
            <Button
                testID="masterSignOut"
                position="absolute"
                top={10}
                left={200}
                bg="black"
                size="xs"
                onPress={handleSignOut}
                color="black">
                SignOut
            </Button>
        </Box>
    );
}
