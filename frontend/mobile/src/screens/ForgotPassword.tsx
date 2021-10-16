import React, {useState} from 'react';
import {BackButton, EmailInput, Header, Screen} from '@components';
import {Email} from '@src/types';
import {Button, Center, Heading, Modal, Stack} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {useForgotPasswordMutation} from '@api';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '@src/App';

export type ForgotPasswordNavProps = StackNavigationProp<AuthStackParamList, 'forgotPassword'>;

export function ForgotPassword() {
    const [email, setEmail] = useState<Email>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const navigation = useNavigation<ForgotPasswordNavProps>();
    const [forgotPassword] = useForgotPasswordMutation();

    const handleBack = () => {
        navigation.navigate('signIn');
    };

    const handleSubmit = () => {
        forgotPassword({email});
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        navigation.navigate('signIn');
    };

    return (
        <>
            <Header
                leftContent={
                    <BackButton testID="backBtn" onPress={handleBack}>
                        Sign In
                    </BackButton>
                }
            />
            <Screen testID="forgotPasswordScreen">
                <Center flex={2}>
                    <Heading>Forgot Password?</Heading>
                </Center>
                <Center flex={4}>
                    <Stack width="90%" space={2}>
                        <EmailInput onChangeText={(value) => setEmail(value)} value={email} />
                        <Button testID="submitBtn" colorScheme="primary" borderRadius={100} onPress={handleSubmit}>
                            Submit
                        </Button>
                    </Stack>
                </Center>
                <Modal isOpen={isOpen} onClose={handleClose}>
                    <Modal.Content>
                        <Modal.CloseButton />
                        <Modal.Body testID="emailSentNotice" mt={7}>
                            A email to reset your password has been sent.
                        </Modal.Body>
                        <Modal.Footer justifyContent="center">
                            <Button testID="okBtn" onPress={handleClose}>
                                Ok
                            </Button>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </Screen>
        </>
    );
}