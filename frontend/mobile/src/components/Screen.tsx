import React, {ReactNode, FC} from 'react';
import {color, space, FlexProps, SpaceProps, ColorProps} from 'styled-system';
import {Container} from '@components/Container';
import styled from 'styled-components/native';
import {SafeAreaView} from 'react-native-safe-area-context';

const VerticallyPaddedView = styled.View<SpaceProps & ColorProps>`
    flex: 1;
    ${space};
    ${color};
`;

const InnerView = styled.View<SpaceProps>`
    flex: 1;
    ${space};
`;

interface ScreenProps {
    /** The content to render within the screen */
    children?: ReactNode;
    /** Whether to force the topInset. Use to prevent screen jank on tab screens */
    forceTopInset?: Boolean;
}

type ComponentProps = ScreenProps & FlexProps & SpaceProps & ColorProps;

export const Screen: FC<ComponentProps> = ({
    backgroundColor,
    paddingTop = 0,
    paddingBottom = 0,
    forceTopInset,
    children,
    ...screenProps
}) => (
    <Container fill bg={backgroundColor} screenMargins>
        <SafeAreaView style={{flex: 1}}>
            <VerticallyPaddedView pt={paddingTop} pb={paddingBottom}>
                <InnerView {...screenProps}>{children}</InnerView>
            </VerticallyPaddedView>
        </SafeAreaView>
    </Container>
);
