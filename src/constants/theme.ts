import '@/global.css';

const colorPalette = {
    lightLime: '#E6F0D0',
    midLightLime: '#DDF690',
    midLime: '#90C400',
    darkLime: '#5E8000',
    white: '#fff',
    lightGray: '#E6E6E6',
    midLightGray: '#D9D9D9',
    midDarkGray: '#A1A1A1',
    darkGray: '#949494'
};

export const Colors = {
    background: colorPalette.lightLime,
    box: {
        background: colorPalette.white,
        border: colorPalette.lightGray
    },
    interface: {
        border: colorPalette.midDarkGray,
        text: colorPalette.darkGray,
        box: colorPalette.midLightGray
    },
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
    },
    icon: {
        darkLime: colorPalette.darkLime
    },
    label: colorPalette.darkLime,
    heading: colorPalette.darkLime,
    timeLine: colorPalette.midLime,
    timeCircle: colorPalette.midLightLime,
    textLink: colorPalette.darkLime
} as const;