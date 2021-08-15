import React from 'react';
import {App as AppBase} from '@src/App';
import {Box, Button} from 'native-base';
import {useDispatch} from 'react-redux';
import {signOut} from '@actions';

export function App() {
    const dispatch = useDispatch();

    const handleSignOut = () => {
        dispatch(signOut());
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
