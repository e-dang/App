import {loginAsync} from '@actions';
import {LoadingModal, Screen} from '@components';
import {Email, Password} from '@src/types';
import {useSelector} from '@utils';
import {Button, Center, FormControl, Heading, Input, Stack} from 'native-base';
import React from 'react';
import {useState} from 'react';
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

    return (
        <Screen testID="signInScreen">
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
                </Stack>
            </Center>
        </Screen>
    );
}
