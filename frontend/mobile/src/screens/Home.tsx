import React, {memo} from 'react';
import {Platform} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Screen} from '@components';
import {Button, Center, Stack, Text, VStack} from 'native-base';

function HomeScreen() {
    const {t} = useTranslation();

    const instructions = Platform.select({
        ios: t('iosInstruction'),
        android: t('androidInstruction'),
    });

    return (
        <Screen testID="homeScreen">
            <VStack space={2}>
                <Center>
                    <Text>{t('welcome')}</Text>
                </Center>
                <Center>
                    <Stack direction="column" space={2} width="90%">
                        <Text>{t('instructions')}</Text>
                        <Text>{instructions}</Text>
                        <Button onPress={() => null}>{t('fetchUser')}</Button>
                    </Stack>
                </Center>
            </VStack>
        </Screen>
    );
}

export const Home = memo(HomeScreen);
