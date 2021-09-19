import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import RNBootSplash from 'react-native-bootsplash';
import {Home, Settings, SignUp, Welcome, SignIn, ForgotPassword} from '@screens';
import {useSelector} from '@hooks';
import {selectAuthToken} from '@selectors';

export type AppTabParamList = {
    home: undefined;
    settings: undefined;
};

export type AuthStackParamList = {
    welcome: undefined;
    signUp: undefined;
    signIn: undefined;
    forgotPassword: undefined;
};

export type RootStackParamList = AppTabParamList & AuthStackParamList;

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createStackNavigator<AuthStackParamList>();

export const App = () => {
    const token = useSelector(selectAuthToken);
    const {t} = useTranslation();

    const init = async () => {};

    React.useEffect(() => {
        init().finally(() => {
            RNBootSplash.hide({fade: true}); // fade animation
        });
    }, []);

    return token !== null ? (
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen
                name="home"
                component={Home}
                options={{
                    tabBarTestID: 'navHome',
                    tabBarLabel: t('home'),
                    // tabBarIcon: ({focused, color, size}) => (
                    //     <Icon
                    //         name={focused ? 'home' : 'home-outline'}
                    //         type="material-community"
                    //         size={size}
                    //         color={color}
                    //     />
                    // ),
                }}
            />
            <Tab.Screen
                name="settings"
                component={Settings}
                options={{
                    tabBarTestID: 'navSettings',
                    tabBarLabel: t('settings'),
                    // tabBarIcon: ({focused, color, size}) => (
                    //     <Icon
                    //         name={focused ? 'cog' : 'cog-outline'}
                    //         type="material-community"
                    //         size={size}
                    //         color={color}
                    //     />
                    // ),
                }}
            />
        </Tab.Navigator>
    ) : (
        <Stack.Navigator initialRouteName="welcome" screenOptions={{headerShown: false}}>
            <Stack.Screen name="welcome" component={Welcome} />
            <Stack.Screen name="signUp" component={SignUp} />
            <Stack.Screen name="signIn" component={SignIn} />
            <Stack.Screen name="forgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
    );
};
