import React, {useState} from 'react';
import {loginAsync} from '@actions';
import {LoadingModal, Screen, BackButton, Header} from '@components';
import {Email, Password} from '@src/types';
import {NavigationService, useSelector} from '@utils';
import {Box, Button, Center, Divider, FormControl, Heading, Input, Stack, Text} from 'native-base';
import {useDispatch} from 'react-redux';
import {get} from 'lodash';

export function SignIn() {
    const [email, setEmail] = useState<Email>('');
    const [password, setPassword] = useState<Password>('');
    const dispatch = useDispatch();
    const error = useSelector((state) => get(state.errorStates, 'LOGIN.error', '') as string);
    const isPending = useSelector((state) => get(state.pendingStates, 'LOGIN.pending', false) as boolean);

    const handleSignIn = () => {
        dispatch(loginAsync.request({email, password}));
    };

    const cancelLogin = () => {
        dispatch(loginAsync.cancel());
    };

    const handleBack = () => {
        NavigationService.navigate('welcome');
    };

    const handleForgotPassword = () => {
        NavigationService.navigate('forgotPassword');
    };

    const handleSignUp = () => {
        NavigationService.navigate('register');
    };

    return (
        <>
            <Header
                leftContent={
                    <BackButton testID="backBtn" onPress={handleBack}>
                        Welcome
                    </BackButton>
                }
                rightContent={
                    <Button
                        testID="forgotPasswordBtn"
                        colorScheme="primary"
                        variant="ghost"
                        onPress={handleForgotPassword}>
                        Forgot password?
                    </Button>
                }
            />
            <Screen testID="signInScreen">
                <LoadingModal isLoading={isPending} onClose={cancelLogin} />
                <Center flex={4}>
                    <Heading>Sign In</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <FormControl isInvalid={!!error}>
                            <Input
                                testID="emailInput"
                                variant="rounded"
                                onChangeText={(value) => setEmail(value)}
                                value={email}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                isInvalid={!!error}
                            />
                            <FormControl.ErrorMessage>{error}</FormControl.ErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!error}>
                            <Input
                                testID="passwordInput"
                                variant="rounded"
                                onChangeText={(value) => setPassword(value)}
                                value={password}
                                placeholder="Password"
                                keyboardType="default"
                                secureTextEntry={true}
                            />
                        </FormControl>
                        <Button testID="signInBtn" colorScheme="primary" borderRadius={100} onPress={handleSignIn}>
                            Sign In
                        </Button>
                        <Divider my={3} />
                        <Box>
                            <Text alignSelf="center">Don't have an account?</Text>
                            <Button testID="signUpBtn" colorScheme="primary" variant="ghost" onPress={handleSignUp}>
                                Sign Up
                            </Button>
                        </Box>
                    </Stack>
                </Center>
            </Screen>
        </>
    );
}
