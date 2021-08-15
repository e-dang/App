import React, {useState} from 'react';
import {registerAsync} from '@actions';
import {Screen, LoadingModal, BackButton, Header, PasswordInput, EmailInput, NameInput} from '@components';
import {Email, Name, Password, RegistrationInfo} from '@src/types';
import {useSelector} from '@utils';
import {Box, Button, Center, Divider, Heading, Stack, Text} from 'native-base';
import {useDispatch} from 'react-redux';
import {get} from 'lodash';
import {useNavigation} from '@react-navigation/native';

export function Register() {
    const isPending = useSelector((state) => get(state.pendingStates, 'REGISTER.pending', false) as boolean);
    const dispatch = useDispatch();
    const navigation = useNavigation();
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
        navigation.navigate('welcome');
    };

    const handleSignIn = () => {
        navigation.navigate('signIn');
    };

    return (
        <>
            <Header
                leftContent={
                    <BackButton testID="backBtn" alignSelf="flex-start" onPress={handleBack}>
                        Welcome
                    </BackButton>
                }
            />
            <Screen testID="emailSignUpScreen">
                <LoadingModal isLoading={isPending} onClose={cancelRegister} />
                <Center flex={4}>
                    <Heading>Sign Up</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <NameInput onChangeText={(value) => setName(value)} value={name} />
                        <EmailInput onChangeText={(value) => setEmail(value)} value={email} />
                        <PasswordInput onChangeText={(value) => setPassword1(value)} value={password1} />
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
