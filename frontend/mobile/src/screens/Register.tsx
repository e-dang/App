import React from 'react';
import {registerAsync} from '@actions';
import {Screen} from '@components';
import {Email, Name, Password, RegistrationInfo} from '@src/types';
import {getPending, useSelector} from '@utils';
import {Button, Center, Input, Modal, Spinner, Stack} from 'native-base';
import {useState} from 'react';
import {useDispatch} from 'react-redux';

export function Register() {
    const isPending = useSelector((state) => getPending(state.pendingStates, 'REGISTER'));
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

    return (
        <Screen>
            <Center>
                <Modal isOpen={isPending} onClose={cancelRegister}>
                    <Modal.CloseButton mt={3} />
                    <Spinner testID="loadingModal" accessibilityLabel="Loading posts" />
                </Modal>
            </Center>
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
