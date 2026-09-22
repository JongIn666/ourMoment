import '@/global.css';

const colorPalette = {
    lightLime: '#E6F0D0',
    midLime: '#90C400',
    darkLime: '#5E8000',
    white: '#fff',
    lightGray: '#E6E6E6',
    gray: '#D9D9D9',
    darkGray: '#949494'
};

export const Colors = {
    background: colorPalette.lightLime,
    button: {
        primary: {
            color: colorPalette.midLime,
            border: colorPalette.darkLime,
            label: colorPalette.white
        },
        secondary: {
            border: colorPalette.midLime,
            label: colorPalette.midLime
        }
    }
} as const;

export const Font = "Noto Sans";