import React, {useState} from 'react';
import {Screen, LoadingModal, BackButton, Header, PasswordInput, EmailInput, NameInput} from '@components';
import {Email, Name, Password} from '@src/types';
import {Box, Button, Center, Divider, Heading, Stack, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from '@hooks';
import {setCredentials} from '@store';
import {useSignUpMutation} from '@api';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@src/App';

export type SignUpNavProps = StackNavigationProp<AuthStackParamList, 'signUp'>;

export function SignUp() {
    const [signUp, {data, error, isLoading}] = useSignUpMutation();
    const dispatch = useDispatch();
    const navigation = useNavigation<SignUpNavProps>();
    const [name, setName] = useState<Name>('');
    const [email, setEmail] = useState<Email>('');
    const [password, setPassword] = useState<Password>('');

    React.useEffect(() => {
        if (data !== undefined) {
            dispatch(setCredentials(data));
        }
    }, [data, dispatch]);

    const handleSignUp = () => {
        signUp({name, email, password1: password, password2: password});
    };

    const cancelSignUp = () => {
        // dispatch(signUpAsync.cancel());
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
                <LoadingModal isLoading={isLoading} onClose={cancelSignUp} />
                <Center flex={4}>
                    <Heading>Sign Up</Heading>
                </Center>
                <Center flex={3}>
                    <Stack width="90%" space={2}>
                        <NameInput error={error} onChangeText={(value) => setName(value)} value={name} />
                        <EmailInput error={error} onChangeText={(value) => setEmail(value)} value={email} />
                        <PasswordInput error={error} onChangeText={(value) => setPassword(value)} value={password} />
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
