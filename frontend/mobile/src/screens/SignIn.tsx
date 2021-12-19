import React, {useState} from 'react';
import {LoadingModal, Screen, BackButton, Header, EmailInput, PasswordInput, HeaderButton} from '@components';
import {Box, Button, Center, Divider, Heading, Spacer, Stack, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from '@hooks';
import {setCredentials} from '@store';
import {useSignInMutation} from '@api';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@src/App';

export type SignInNavProps = StackNavigationProp<AuthStackParamList, 'signIn'>;

export function SignIn() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
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
        <Screen testID="signInScreen">
            <Header
                leftContent={<BackButton onPress={handleBack}>Welcome</BackButton>}
                rightContent={
                    <HeaderButton
                        testID="forgotPasswordBtn"
                        colorScheme="primary"
                        variant="ghost"
                        onPress={handleForgotPassword}>
                        Forgot password?
                    </HeaderButton>
                }
            />
            <Spacer />
            <Box justifyContent="flex-start" flex={4}>
                <Center>
                    <Heading>Sign In</Heading>
                </Center>
            </Box>
            <Center flex={3}>
                <Stack width="90%" space={2}>
                    <EmailInput error={error} onChangeText={(value) => setEmail(value)} value={email} />
                    <PasswordInput error={error} onChangeText={(value) => setPassword(value)} value={password} />
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
            <LoadingModal isLoading={isLoading} />
        </Screen>
    );
}
