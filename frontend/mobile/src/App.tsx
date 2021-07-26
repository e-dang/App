import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import RNBootSplash from 'react-native-bootsplash';
import Icon from 'react-native-easy-icon';
import Home from '@screens/Home';
import Settings from '@screens/Settings';
import Register from '@screens/Register';
import {sleep} from '@utils/async';
import useSelector from '@utils/useSelector';

export type AppTabParamList = {
    Home: undefined;
    Settings: {userID?: string};
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App = () => {
    const user = useSelector((state) => state.users.user);
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
    // <Tab.Navigator>
    //     <Tab.Screen
    //         name="home"
    //         component={Home}
    //         options={{
    //             tabBarLabel: t('home'),
    //             tabBarIcon: ({focused, color, size}) => (
    //                 <Icon
    //                     name={focused ? 'home' : 'home-outline'}
    //                     type="material-community"
    //                     size={size}
    //                     color={color}
    //                 />
    //             ),
    //         }}
    //     />
    //     <Tab.Screen
    //         name="settings"
    //         component={Settings}
    //         options={{
    //             tabBarLabel: t('settings'),
    //             tabBarIcon: ({focused, color, size}) => (
    //                 <Icon
    //                     name={focused ? 'cog' : 'cog-outline'}
    //                     type="material-community"
    //                     size={size}
    //                     color={color}
    //                 />
    //             ),
    //         }}
    //     />
    // </Tab.Navigator>
    return (
        <Stack.Navigator initialRouteName="register" headerMode="none">
            <Stack.Screen name="register" component={Register} />
        </Stack.Navigator>
    );
};

export default App;
