import React, {useState} from 'react';
import {signUpAsync} from '@actions';
import {Screen, LoadingModal, BackButton, Header, PasswordInput, EmailInput, NameInput} from '@components';
import {Email, Name, Password} from '@src/types';
import {useSelector} from '@utils';
import {Box, Button, Center, Divider, Heading, Stack, Text} from 'native-base';
import {useDispatch} from 'react-redux';
import {get} from 'lodash';
import {useNavigation} from '@react-navigation/native';

export function SignUp() {
    const isPending = useSelector((state) => get(state.pendingStates, 'SIGN_UP.pending', false) as boolean);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [name, setName] = useState<Name>('');
    const [email, setEmail] = useState<Email>('');
    const [password, setPassword] = useState<Password>('');

    const handleSignUp = () => {
        dispatch(signUpAsync.request({name, email, password1: password, password2: password}));
    };

    const cancelSignUp = () => {
        dispatch(signUpAsync.cancel());
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
                <LoadingModal isLoading={isPending} onClose={cancelSignUp} />
                <Center flex={4}>
                    <Heading>Sign Up</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <NameInput onChangeText={(value) => setName(value)} value={name} />
                        <EmailInput onChangeText={(value) => setEmail(value)} value={email} />
                        <PasswordInput onChangeText={(value) => setPassword(value)} value={password} />
                        <Button testID="signUpBtn" colorScheme="primary" borderRadius={100} onPress={handleSignUp}>
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
