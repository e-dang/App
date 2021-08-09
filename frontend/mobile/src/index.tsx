import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {App} from '@src/wrapper';
import {persistor, store} from '@src/store';
import {NavigationService, navigationRef} from '@utils/navigationService';
import '@i18n';
import {enableScreens} from 'react-native-screens';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NativeBaseProvider} from 'native-base';

/**
 * Optimize memory usage and performance: https://reactnavigation.org/docs/react-native-screens/
 */
enableScreens();

export default function Root() {
    useEffect(() => {
        NavigationService.isReady = false;
    }, []);
    return (
        <SafeAreaProvider>
            <NativeBaseProvider>
                <Provider store={store}>
                    <PersistGate loading={<View />} persistor={persistor}>
                        <NavigationContainer
                            ref={navigationRef}
                            onReady={() => {
                                NavigationService.isReady = true;
                            }}>
                            <App />
                        </NavigationContainer>
                    </PersistGate>
                </Provider>
            </NativeBaseProvider>
        </SafeAreaProvider>
    );
}
