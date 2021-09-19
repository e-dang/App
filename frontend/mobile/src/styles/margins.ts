export interface Margins {
    screenMargin: string;
}

export interface Sizes {
    heights: string[];
    widths: string[];
}

export const margins: Margins = {
    screenMargin: '16px',
};

export const space = [0, 4, 8, 16, 24, 32, 64, 128];
export const radii = [0, 4, 8, 14];
export const sizes: Sizes = {
    heights: ['0px', '16px', '32px', '64px', '128px', '256px', '100%'],
    widths: ['0px', '16px', '32px', '64px', '128px', '256px', '100%'],
};
