import {registerAsync} from '@src/actions/authActions';
import {Email, Name, Password, RegistrationInfo} from '@src/types/auth';
import useSelector from '@src/utils/useSelector';
import React, {memo} from 'react';
import {useState} from 'react';
import {View, SafeAreaView} from 'react-native';
import {Input, Button} from 'react-native-elements';
import {useDispatch} from 'react-redux';

function Register() {
    const pendingState = useSelector((state) => state.pendingStates);
    const dispatch = useDispatch();
    const [name, setName] = useState<Name>('');
    const [email, setEmail] = useState<Email>('');
    const [password1, setPassword1] = useState<Password>('');
    const [password2, setPassword2] = useState<Password>('');

    const handleRegister = () => {
        dispatch(registerAsync.request({name, email, password1, password2} as RegistrationInfo));
    };

    return (
        <SafeAreaView>
            <View>
                <Input
                    testID="name"
                    onChangeText={(value) => setName(value)}
                    value={name}
                    placeholder="Name"
                    keyboardType="default"
                />
            </View>
            <View>
                <Input
                    testID="email"
                    onChangeText={(value) => setEmail(value)}
                    value={email}
                    placeholder="Email"
                    keyboardType="email-address"
                />
            </View>
            <View>
                <Input
                    onChangeText={(value) => setPassword1(value)}
                    value={password1}
                    placeholder="Password"
                    keyboardType="default"
                    secureTextEntry={true}
                />
            </View>
            <View>
                <Input
                    onChangeText={(value) => setPassword2(value)}
                    value={password2}
                    placeholder="Confirm Password"
                    keyboardType="default"
                    secureTextEntry={true}
                />
            </View>
            <View>
                <Button title="Submit" onPress={handleRegister} />
            </View>
        </SafeAreaView>
    );
}

export default memo(Register);
