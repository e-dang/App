import React, {FC} from 'react';
import {TextInputProps as TextInputBaseProps} from 'react-native';
import {
    borders,
    color,
    layout,
    space,
    flex,
    typography,
    textStyle,
    BorderProps,
    FlexProps,
    ColorProps,
    LayoutProps,
    SpaceProps,
    TextStyleProps,
    TypographyProps,
} from 'styled-system';
import {Container} from '@components/Container';
import {Text} from '@components/Text';
import styled from 'styled-components/native';
import {StyledComponent} from 'styled-components';

interface TextInputProps extends TextInputBaseProps {
    /** An optional header label to render above the input */
    topLabel?: string;
    //** An option icon to be displayed to the left of the input box */
    icon?: React.ReactNode;
    /**
     * Overrides the text that's read by the screen reader when the user interacts with the element. By default, the
     * label is constructed by traversing all the children and accumulating all the Text nodes separated by space.
     */
    accessibilityLabel?: string;
}

type ComponentProps = TextInputProps &
    ColorProps &
    SpaceProps &
    TextStyleProps &
    TypographyProps &
    BorderProps &
    LayoutProps &
    FlexProps;

const InputContainer = styled(Container)``;

const Input = styled.TextInput`
    ${flex};
    ${borders};
    ${color};
    ${layout};
    ${space};
    ${textStyle};
    ${typography};
`;

// NOTE: for layout and dimensioning of TextInput, wrap it in a Container
//marginVertical={0.5}
export const TextInput: FC<ComponentProps> = ({
    topLabel,
    icon,
    accessibilityLabel,
    multiline,
    borderColor,
    borderRadius,
    ...inputProps
}) => (
    <Container fill={multiline} fullWidth my={1}>
        {topLabel ? (
            <Text color="gray" fontSize={2}>
                {topLabel}
            </Text>
        ) : null}
        <InputContainer borderRadius={borderRadius} borderColor={borderColor}>
            {icon ? icon : null}
            <Input
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                multiline={multiline}
                accessibilityLabel={accessibilityLabel}
                {...inputProps}
            />
        </InputContainer>
    </Container>
);

type ExtractPropType<P> = P extends StyledComponent<any, any, infer T, any> ? T : never;

InputContainer.defaultProps = {
    flexDirection: 'row',
    bg: 'white',
    borderWidth: 1,
    borderColor: 'black',
    minHeight: 'heights.3',
    pl: 2,
    alignItems: 'center',
} as Partial<ExtractPropType<typeof Container>>;

TextInput.defaultProps = {
    p: 2,
    textAlignVertical: 'center',
    width: 'widths.6',
};
