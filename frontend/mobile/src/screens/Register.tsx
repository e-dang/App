import React, {useState} from 'react';
import {registerAsync} from '@actions';
import {Screen, LoadingModal, BackButton} from '@components';
import {Email, Name, Password, RegistrationInfo} from '@src/types';
import {NavigationService, useSelector} from '@utils';
import {Button, Center, HStack, Input, Stack} from 'native-base';
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

    return (
        <Screen testID="emailSignUpScreen">
            <HStack alignItems="center" py={2} mb={8} width="100%" alignSelf="stretch">
                <BackButton testID="backBtn" onPress={handleBack}>
                    Welcome
                </BackButton>
            </HStack>
            <LoadingModal isLoading={isPending} onClose={cancelRegister} />
            <Center flex={1}>
                <Stack width="90%" space={2}>
                    <Input
                        testID="nameInput"
                        variant="rounded"
                        onChangeText={(value) => setName(value)}
                        value={name}
                        placeholder="Name"
                        keyboardType="default"
                    />
                    <Input
                        testID="emailInput"
                        variant="rounded"
                        onChangeText={(value) => setEmail(value)}
                        value={email}
                        placeholder="Email"
                        keyboardType="email-address"
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
                </Stack>
            </Center>
        </Screen>
    );
}
