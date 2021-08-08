import React from 'react';
import {Center, Button, Icon as NativeIcon, Stack, Box, Heading} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Screen} from '@components';
import {NavigationService} from '@utils';

export function Welcome() {
    const handleSignUpWithEmail = () => {
        NavigationService.navigate('register');
    };

    return (
        <Screen testID="welcomeScreen">
            <Center flex={2}>
                <Heading>Welcome!</Heading>
            </Center>
            <Center flex={4}>
                <Stack direction="column" space={2} width="90%">
                    <Button
                        borderRadius={100}
                        testID="emailSignUpBtn"
                        onPress={handleSignUpWithEmail}
                        startIcon={<NativeIcon as={Icon} name="envelope" size={5} />}>
                        Sign In With Email
                    </Button>
                    <Button
                        borderRadius={100}
                        testID="appleSignUpBtn"
                        variant="outline"
                        colorScheme="secondary"
                        onPress={() => console.log('Apple')}
                        startIcon={<NativeIcon as={Icon} name="apple" size={5} color="black" />}>
                        Sign In With Apple
                    </Button>
                    <Button
                        borderRadius={100}
                        testID="fbSignUpBtn"
                        variant="outline"
                        colorScheme="secondary"
                        onPress={() => console.log('Facebook')}
                        startIcon={<NativeIcon as={Icon} name="facebook" size={5} color="black" />}>
                        Sign In With Facebook
                    </Button>
                    <Button
                        borderRadius={100}
                        testID="googleSignUpBtn"
                        variant="outline"
                        colorScheme="secondary"
                        onPress={() => console.log('Google')}
                        startIcon={<NativeIcon as={Icon} name="google" size={5} color="black" />}>
                        Sign In With Google
                    </Button>
                </Stack>
            </Center>
        </Screen>
    );
}
