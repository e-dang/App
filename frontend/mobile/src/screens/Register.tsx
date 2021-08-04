import {registerAsync} from '@actions';
import {Email, Name, Password, RegistrationInfo} from '@src/types/auth';
import {getPending, useSelector} from '@utils';
import React, {memo} from 'react';
import {useState} from 'react';
import {View, SafeAreaView, Modal, ActivityIndicator} from 'react-native';
import {Input, Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

function RegisterScreen() {
    const isPending = useSelector((state) => getPending(state.pendingStates, 'REGISTER'));
    const dispatch = useDispatch();
    const [name, setName] = useState<Name>('');
    const [email, setEmail] = useState<Email>('');
    const [password1, setPassword1] = useState<Password>('');

    const handleRegister = () => {
        dispatch(registerAsync.request({name, email, password1, password2: password1} as RegistrationInfo));
    };

    return (
        <SafeAreaView>
            <View>
                <Modal
                    transparent={true}
                    animationType={'none'}
                    visible={isPending}
                    onRequestClose={() => {
                        console.log('close modal');
                    }}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            backgroundColor: '#00000040',
                        }}>
                        <View>
                            <ActivityIndicator testID="loadingModal" animating={isPending} size={'large'} />
                        </View>
                    </View>
                </Modal>
                <View>
                    <Input
                        testID="nameInput"
                        onChangeText={(value) => setName(value)}
                        value={name}
                        placeholder="Name"
                        keyboardType="default"
                    />
                </View>
                <View>
                    <Input
                        testID="emailInput"
                        onChangeText={(value) => setEmail(value)}
                        value={email}
                        placeholder="Email"
                        keyboardType="email-address"
                    />
                </View>
                <View>
                    <Input
                        testID="passwordInput"
                        onChangeText={(value) => setPassword1(value)}
                        value={password1}
                        placeholder="Password"
                        keyboardType="default"
                        secureTextEntry={true}
                    />
                </View>
                <View>
                    <Button testID="signUpBtn" title="Sign Up" onPress={handleRegister} />
                </View>
            </View>
        </SafeAreaView>
    );
}

export const Register = memo(RegisterScreen);
