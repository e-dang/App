import React, {memo} from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Header, Screen} from '@components';
import {Button, Center, Stack, Text} from 'native-base';

function HomeScreen() {
    const {t} = useTranslation();

    const instructions = Platform.select({
        ios: t('iosInstruction'),
        android: t('androidInstruction'),
    });

    return (
        <>
            <Header />
            <Screen testID="homeScreen">
                <Center flex={4}>
                    <Text>{t('welcome')}</Text>
                </Center>
                <Center flex={3}>
                    <Stack direction="column" space={2} width="90%">
                        <Text>{t('instructions')}</Text>
                        <Text>{instructions}</Text>
                        <Button onPress={() => null}>{t('fetchUser')}</Button>
                    </Stack>
                </Center>
            </Screen>
        </>
    );
}

export const Home = memo(HomeScreen);
