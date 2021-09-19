import React, {useState} from 'react';
import {LoadingModal, Screen, BackButton, Header, EmailInput, PasswordInput} from '@components';
import {Email, Password} from '@src/types';
import {Box, Button, Center, Divider, Heading, Stack, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from '@hooks';
import {setCredentials} from '@store';
import {useSignInMutation} from '@api';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@src/App';

export type SignInNavProps = StackNavigationProp<AuthStackParamList, 'signIn'>;

export function SignIn() {
    const [email, setEmail] = useState<Email>('');
    const [password, setPassword] = useState<Password>('');
    const navigation = useNavigation<SignInNavProps>();
    const dispatch = useDispatch();
    const [signIn, {data, error, isLoading}] = useSignInMutation();

    React.useEffect(() => {
        if (data !== undefined) {
            dispatch(setCredentials(data));
        }
    }, [data, dispatch]);

    const handleSignIn = () => {
        signIn({email, password});
    };

    const cancelSignIn = () => {
        // dispatch(signInAsync.cancel());
    };

    const handleBack = () => {
        navigation.navigate('welcome');
    };

    const handleForgotPassword = () => {
        navigation.navigate('forgotPassword');
    };

    const handleSignUp = () => {
        navigation.navigate('signUp');
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
                <LoadingModal isLoading={isLoading} onClose={cancelSignIn} />
                <Center flex={4}>
                    <Heading>Sign In</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <EmailInput onChangeText={(value) => setEmail(value)} value={email} />
                        <PasswordInput onChangeText={(value) => setPassword(value)} value={password} />
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
