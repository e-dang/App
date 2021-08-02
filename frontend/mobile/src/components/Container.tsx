import {
    BorderProps,
    borders,
    color,
    ColorProps,
    flexbox,
    FlexProps,
    layout,
    LayoutProps,
    space,
    SpaceProps,
} from 'styled-system';
import styled from 'styled-components/native';

interface ContainerProps {
    /** applies "flex: 1" style */
    fill?: boolean;
    /** applies "width: 100%" style */
    fullWidth?: boolean;
    /** centers content both vertically and horizontally */
    centerContent?: boolean;
    /**
     * applies default horizontal screen margins.
     * decoupled from Screen component to make layout-building more flexible.
     */
    screenMargins?: boolean;
}

type ComponentProps = ContainerProps & BorderProps & ColorProps & FlexProps & SpaceProps & LayoutProps;

/**
 * This is our primitive View component with styled-system props applied
 */
export const Container = styled.View<ComponentProps>`
    ${space};
    ${color};
    ${borders};
    ${layout};
    ${flexbox};
    ${(props) =>
        props.fill &&
        `
        flex: 1;
      `}
    ${(props) =>
        props.fullWidth &&
        `
        width: 100%;
      `}
    ${(props) =>
        props.centerContent &&
        `
        justifyContent: center;
        alignItems: center;
      `}
    ${({theme, ...props}) => props.screenMargins && `paddingHorizontal: ${theme.margins.screenMargin}; `}
`;
