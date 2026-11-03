import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_URL } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

type MediaItem = {
  id: string | number;
  type: 'image' | 'video';
  url: string;
};

function PostVideo({ source, compact }: { source: VideoSource; compact: boolean }) {
  const player = useVideoPlayer(source);
  return <VideoView player={player} style={[styles.video, compact && styles.previewMedia]} nativeControls />;
}

export function PostMedia({ media, onRemove, compact = false }: {
  media: MediaItem[];
  onRemove?: (id: string | number) => void;
  compact?: boolean;
}) {
  const { token } = useAuth();

  const items = media.map((item) => {
    const source = {
      uri: item.url,
      ...(token && item.url.startsWith(`${API_URL}/api/media/`) ? {
        headers: { Authorization: `Token ${token}`, 'ngrok-skip-browser-warning': 'true' },
      } : {}),
    };

    return (
      <View key={item.id} style={[styles.item, compact && styles.previewItem]}>
        {item.type === 'video' ? (
          <PostVideo source={source} compact={compact} />
        ) : (
          <Image source={source} style={[styles.image, compact && styles.previewMedia]} resizeMode="contain" />
        )}
        {onRemove && (
          <Pressable accessibilityLabel="Remove attachment" onPress={() => onRemove(item.id)}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        )}
      </View>
    );
  });

  return compact ? (
    <ScrollView horizontal style={styles.previewList} contentContainerStyle={styles.previewContent} keyboardShouldPersistTaps="handled">
      {items}
    </ScrollView>
  ) : (
    <View style={styles.list}>{items}</View>
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
  previewList: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  previewContent: {
    gap: 10,
  },
  previewItem: {
    width: 100,
  },
  previewMedia: {
    width: 100,
    height: 100,
    aspectRatio: 1,
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
