import styled from 'styled-components/native';
import {
    color,
    space,
    typography,
    textStyle,
    ColorProps,
    SpaceProps,
    TextStyleProps,
    TypographyProps,
} from 'styled-system';

interface TextProps {}

type ComponentProps = TextProps & ColorProps & SpaceProps & TextStyleProps & TypographyProps;

/**
 * This is our primitive Text component with styled-system props applied
 */
export const Text = styled.Text<ComponentProps>`
    ${space};
    ${color};
    ${typography};
    ${textStyle};
`;

Text.defaultProps = {
    color: 'black',
    fontSize: 3,
    fontFamily: 'regular',
};
