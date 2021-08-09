import React from 'react';
import {App as AppBase} from '@src/App';
import {Box, Button} from 'native-base';
import {persistor} from './store';

export function App() {
    const handleLogout = () => {
        persistor.purge();
    };

    return (
        <Box flex={1}>
            <AppBase />
            <Button
                testID="masterLogout"
                position="absolute"
                top={10}
                left={200}
                bg="black"
                size="xs"
                onPress={handleLogout}
                color="black">
                Logout
            </Button>
        </Box>
    );
}
