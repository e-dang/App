export interface Colors {
    blue: string;
    indigo: string;
    purple: string;
    pink: string;
    red: string;
    orange: string;
    yellow: string;
    green: string;
    teal: string;
    cyan: string;
    white: string;
    black: string;
    gray: string;
    grayDark: string;
    grayLight: string;
    transparent: string;
    primary: string;
    secondary: string;
    success: string;
    info: string;
    warning: string;
    danger: string;
    light: string;
    dark: string;
    disabled: string;
}

const black = '#000';
const white = '#fff';
const transparent = 'rgba(0, 0, 0, 0)';

export const lightColors: Colors = {
    blue: '#2c3e50',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#e83e8c',
    red: '#e74c3c',
    orange: '#fd7e14',
    yellow: '#f39c12',
    green: '#18bc9c',
    teal: '#20c997',
    cyan: '#3498db',
    white,
    black,
    gray: '#95a5a6',
    grayDark: '#343a40',
    grayLight: '#dedede',
    transparent,
    primary: '#2c3e50',
    secondary: '#95a5a6',
    success: '#18bc9c',
    info: '#3498db',
    warning: '#f39c12',
    danger: '#e74c3c',
    light: '#ecf0f1',
    dark: '#7b8a8b',
    disabled: '#C4C4C4',
};

export const darkColors: Colors = {
    blue: '#375a7f',
    indigo: '#6610f2',
    purple: '#6f42c1',
    pink: '#e83e8c',
    red: '#e74c3c',
    orange: '#fd7e14',
    yellow: '#f39c12',
    green: '#00bc8c',
    teal: '#20c997',
    cyan: '#3498db',
    white,
    black,
    gray: '#888',
    grayDark: '#303030',
    grayLight: '#dedede',
    transparent,
    primary: '#375a7f',
    secondary: '#444',
    success: '#00bc8c',
    info: '#3498db',
    warning: '#f39c12',
    danger: '#e74c3c',
    light: '#adb5bd',
    dark: '#303030',
    disabled: '#C4C4C4',
};
