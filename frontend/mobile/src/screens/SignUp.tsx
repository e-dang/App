import React, {useState} from 'react';
import {Screen, LoadingModal, BackButton, Header, PasswordInput, EmailInput, NameInput} from '@components';
import {Box, Button, Center, Divider, Heading, Spacer, Stack, Text} from 'native-base';
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
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    React.useEffect(() => {
        if (data !== undefined) {
            dispatch(setCredentials(data));
        }
    }, [data, dispatch]);

    const handleSignUp = () => {
        signUp({name, email, password});
    };

    const handleBack = () => {
        navigation.navigate('welcome');
    };

    const handleSignIn = () => {
        navigation.navigate('signIn');
    };

    return (
        <Screen testID="emailSignUpScreen">
            <Header
                leftContent={
                    <BackButton alignSelf="flex-start" onPress={handleBack}>
                        Welcome
                    </BackButton>
                }
            />
            <Spacer />
            <Box justifyContent="flex-start" flex={4}>
                <Center>
                    <Heading>Sign Up</Heading>
                </Center>
            </Box>
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
            <LoadingModal isLoading={isLoading} />
        </Screen>
    );
}
