import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { API_URL } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

type MediaItem = {
  id: string | number;
  type: 'image' | 'video';
  url: string;
};

function PostVideo({ source }: { source: VideoSource }) {
  const player = useVideoPlayer(source);
  return <VideoView player={player} style={styles.video} nativeControls />;
}

export function PostMedia({ media, onRemove }: {
  media: MediaItem[];
  onRemove?: (id: string | number) => void;
}) {
  const { token } = useAuth();

  return (
    <View style={styles.list}>
      {media.map((item) => {
        const source = {
          uri: item.url,
          ...(token && item.url.startsWith(`${API_URL}/api/media/`) ? {
            headers: { Authorization: `Token ${token}`, 'ngrok-skip-browser-warning': 'true' },
          } : {}),
        };

        return (
          <View key={item.id} style={styles.item}>
            {item.type === 'video' ? (
              <PostVideo source={source} />
            ) : (
              <Image source={source} style={styles.image} resizeMode="contain" />
            )}
            {onRemove && (
              <Pressable accessibilityLabel="Remove attachment" onPress={() => onRemove(item.id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
    gap: 10,
  },
  item: {
    gap: 4,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  remove: {
    alignSelf: 'flex-end',
    color: Colors.textLink,
    padding: 6,
  },
});
