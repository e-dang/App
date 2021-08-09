import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import RNBootSplash from 'react-native-bootsplash';
import {Home, Settings, Register, Welcome, SignIn, ForgotPassword} from '@screens';
import {sleep, useSelector} from '@utils';

export type AppTabParamList = {
    Home: undefined;
    Settings: {userID?: string};
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export const App = () => {
    const token = useSelector((state) => state.auth.token);
    const init = async () => {
        await sleep(1000);
        // …do multiple async tasks
    };

    React.useEffect(() => {
        init().finally(() => {
            RNBootSplash.hide({fade: true}); // fade animation
        });
    }, []);

    const {t} = useTranslation();
    return token ? (
        <Tab.Navigator>
            <Tab.Screen
                name="home"
                component={Home}
                options={{
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
        <Stack.Navigator initialRouteName="welcome" headerMode="none">
            <Stack.Screen name="welcome" component={Welcome} />
            <Stack.Screen name="register" component={Register} />
            <Stack.Screen name="signIn" component={SignIn} />
            <Stack.Screen name="forgotPassword" component={ForgotPassword} />
        </Stack.Navigator>
    );
};
