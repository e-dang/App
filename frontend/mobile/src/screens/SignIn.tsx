import React, {useState} from 'react';
import {loginAsync} from '@actions';
import {LoadingModal, Screen, BackButton} from '@components';
import {Email, Password} from '@src/types';
import {NavigationService, useSelector} from '@utils';
import {Button, Center, Divider, FormControl, Heading, HStack, Input, Stack} from 'native-base';
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

    return (
        <Screen testID="signInScreen">
            <HStack alignItems="center" py={2} mb={8} width="100%" alignSelf="stretch">
                <BackButton testID="backBtn" onPress={handleBack}>
                    Welcome
                </BackButton>
            </HStack>
            <LoadingModal isLoading={isPending} onClose={cancelLogin} />
            <Center flex={2}>
                <Heading>Sign In</Heading>
            </Center>
            <Center flex={4}>
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
                    <Divider />
                    <Button
                        testID="forgotPasswordBtn"
                        colorScheme="primary"
                        variant="ghost"
                        onPress={handleForgotPassword}>
                        Forgot password?
                    </Button>
                </Stack>
            </Center>
        </Screen>
    );
}
