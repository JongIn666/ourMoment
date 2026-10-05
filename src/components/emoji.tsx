import { type ImageSourcePropType } from 'react-native';

export interface Emoji {
    name: string;
    type: 'unicode' | 'image';
    unicode?: string;
    imgSrc?: ImageSourcePropType
}

export interface EmojiCount {
    emoji: Emoji,
    count: number
}