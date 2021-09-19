import React from 'react';
import {Center, Button, Icon as NativeIcon, Stack, Box, Heading, Text, Divider} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {Header, Screen} from '@components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@src/App';

export type WelcomeNavProps = StackNavigationProp<AuthStackParamList, 'welcome'>;

export function Welcome() {
    const navigation = useNavigation<WelcomeNavProps>();

    const handleSignUpWithEmail = () => {
        navigation.navigate('signUp');
    };

    const handleSignIn = () => {
        navigation.navigate('signIn');
    };

    return (
        <>
            <Header />
            <Screen testID="welcomeScreen">
                <Center flex={4} justifyContent="flex-start">
                    <Heading>Welcome!</Heading>
                </Center>
                <Center flex={3}>
                    <Stack direction="column" space={2} width="90%">
                        <Button
                            borderRadius={100}
                            testID="emailSignUpBtn"
                            onPress={handleSignUpWithEmail}
                            startIcon={<NativeIcon as={Icon} name="envelope" size={5} />}>
                            Sign Up With Email
                        </Button>
                        <Button
                            borderRadius={100}
                            testID="appleSignUpBtn"
                            variant="outline"
                            colorScheme="secondary"
                            onPress={() => console.log('Apple')}
                            startIcon={<NativeIcon as={Icon} name="apple" size={5} color="black" />}>
                            Sign Up With Apple
                        </Button>
                        <Button
                            borderRadius={100}
                            testID="fbSignUpBtn"
                            variant="outline"
                            colorScheme="secondary"
                            onPress={() => console.log('Facebook')}
                            startIcon={<NativeIcon as={Icon} name="facebook" size={5} color="black" />}>
                            Sign Up With Facebook
                        </Button>
                        <Button
                            borderRadius={100}
                            testID="googleSignUpBtn"
                            variant="outline"
                            colorScheme="secondary"
                            onPress={() => console.log('Google')}
                            startIcon={<NativeIcon as={Icon} name="google" size={5} color="black" />}>
                            Sign Up With Google
                        </Button>
                        <Divider my={3} />
                        <Box>
                            <Text alignSelf="center">Already have an account?</Text>
                            <Button testID="signInBtn" variant="ghost" onPress={handleSignIn}>
                                Sign In
                            </Button>
                        </Box>
                    </Stack>
                </Center>
            </Screen>
        </>
    );
}
