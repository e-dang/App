import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {App} from '@src/wrapper';
import {persistor, store} from '@store';
import '@i18n';
import {enableScreens} from 'react-native-screens';
import {NativeBaseProvider} from 'native-base';

/**
 * Optimize memory usage and performance: https://reactnavigation.org/docs/react-native-screens/
 */
enableScreens();

export default function Root() {
    return (
        <NativeBaseProvider>
            <Provider store={store}>
                <PersistGate loading={<View />} persistor={persistor}>
                    <NavigationContainer>
                        <App />
                    </NavigationContainer>
                </PersistGate>
            </Provider>
        </NativeBaseProvider>
    );
}
