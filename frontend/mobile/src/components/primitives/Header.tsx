import React, {FC} from 'react';
import {Box, HStack, StatusBar} from 'native-base';

export interface HeaderProps {
    leftContent?: React.ReactNode;
    rightContent?: React.ReactNode;
    barStyle?: 'light-content' | 'dark-content';
}

export const Header: FC<HeaderProps> = ({leftContent, rightContent, barStyle = 'dark-content'}) => {
    return (
        <>
            <Box safeAreaTop />
            <StatusBar barStyle={barStyle} />
            <HStack px={1} pb={3} justifyContent="space-between" alignItems="center">
                <HStack space={4} alignItems="center">
                    {leftContent}
                </HStack>
                <HStack space={2} alignItems="center">
                    {rightContent}
                </HStack>
            </HStack>
        </>
    );
};
