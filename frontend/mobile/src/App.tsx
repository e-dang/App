import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import RNBootSplash from 'react-native-bootsplash';
import {SignUp, Welcome, SignIn, ForgotPassword, AppStackScreen} from '@screens';
import {useSelector} from '@hooks';
import {selectAuthToken} from '@selectors';
import {useLazyGetAuthUserQuery} from '@api';
import {useDispatch} from '@hooks';
import {setAuthUser} from '@store';

export type AuthStackParamList = {
    welcome: undefined;
    signUp: undefined;
    signIn: undefined;
    forgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const App = () => {
    const token = useSelector(selectAuthToken);
    const dispatch = useDispatch();
    const [getAuthUser, {data}] = useLazyGetAuthUserQuery();

    const init = async () => {};

    React.useEffect(() => {
        init().finally(() => {
            RNBootSplash.hide({fade: true}); // fade animation
        });
    }, []);

    React.useEffect(() => {
        if (token !== undefined) {
            getAuthUser();
        }
    }, [token, getAuthUser]);

    React.useEffect(() => {
        if (data !== undefined) {
            dispatch(setAuthUser(data));
        }
    }, [dispatch, data]);

    return token !== undefined ? (
        <AppStackScreen />
    ) : (
        <Stack.Navigator initialRouteName="welcome" screenOptions={{headerShown: false}}>
            <Stack.Screen name="welcome" component={Welcome} />
            <Stack.Screen name="signUp" component={SignUp} />
            <Stack.Screen name="signIn" component={SignIn} />
            <Stack.Screen name="forgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
    );
};
