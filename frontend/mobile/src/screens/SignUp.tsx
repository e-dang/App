import React, {useState} from 'react';
import {registerAsync} from '@actions';
import {Screen, LoadingModal, BackButton, Header} from '@components';
import {Email, Name, Password, RegistrationInfo} from '@src/types';
import {NavigationService, useSelector} from '@utils';
import {Box, Button, Center, Divider, Heading, HStack, Input, Stack, Text} from 'native-base';
import {useDispatch} from 'react-redux';
import {get} from 'lodash';

export function Register() {
    const isPending = useSelector((state) => get(state.pendingStates, 'REGISTER.pending', false) as boolean);
    const dispatch = useDispatch();
    const [name, setName] = useState<Name>('');
    const [email, setEmail] = useState<Email>('');
    const [password1, setPassword1] = useState<Password>('');

    const handleRegister = () => {
        dispatch(registerAsync.request({name, email, password1, password2: password1} as RegistrationInfo));
    };

    const cancelRegister = () => {
        dispatch(registerAsync.cancel());
    };

    const handleBack = () => {
        NavigationService.navigate('welcome');
    };

    const handleSignIn = () => {
        NavigationService.navigate('signIn');
    };

    return (
        <>
            <Header
                leftContent={
                    <HStack>
                        <BackButton testID="backBtn" alignSelf="flex-start" onPress={handleBack}>
                            Welcome
                        </BackButton>
                    </HStack>
                }
            />
            <Screen testID="emailSignUpScreen">
                <LoadingModal isLoading={isPending} onClose={cancelRegister} />
                <Center flex={4}>
                    <Heading>Sign Up</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <Input
                            testID="nameInput"
                            variant="rounded"
                            onChangeText={(value) => setName(value)}
                            value={name}
                            placeholder="Name"
                            keyboardType="default"
                            autoCorrect={false}
                        />
                        <Input
                            testID="emailInput"
                            variant="rounded"
                            onChangeText={(value) => setEmail(value)}
                            value={email}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Input
                            testID="passwordInput"
                            variant="rounded"
                            onChangeText={(value) => setPassword1(value)}
                            value={password1}
                            placeholder="Password"
                            keyboardType="default"
                            secureTextEntry={true}
                        />
                        <Button testID="signUpBtn" colorScheme="primary" borderRadius={100} onPress={handleRegister}>
                            Sign Up
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
