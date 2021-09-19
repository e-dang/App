import {DefaultTheme} from 'styled-components/native';
import {Colors, lightColors, darkColors} from '@styles/colors';
import {fonts, Fonts, fontSizes, fontWeights} from '@styles/fonts';
import {space, radii, Margins, margins, sizes, Sizes} from '@styles/margins';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: Colors;
        fonts: Fonts;
        fontSizes: number[];
        fontWeights: number[];
        space: number[];
        radii: number[];
        margins: Margins;
        sizes: Sizes;
    }
}

export const lightTheme: DefaultTheme = {
    colors: lightColors,
    fonts,
    fontSizes,
    fontWeights,
    space,
    radii,
    margins,
    sizes,
};

export const darkTheme: DefaultTheme = {
    colors: darkColors,
    fonts,
    fontSizes,
    fontWeights,
    space,
    radii,
    margins,
    sizes,
};
