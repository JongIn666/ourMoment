import { useVideoPlayer, VideoView, type VideoContentFit, type VideoSource, type VideoThumbnail } from 'expo-video';
import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import { API_URL } from '@/constants/api';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';

type MediaItem = {
  id: string | number;
  type: 'image' | 'video';
  url: string;
};

export function PostVideo({ source, compact = false, tapToFullscreen = false, contentFit, style }: { source: VideoSource; compact?: boolean; tapToFullscreen?: boolean; contentFit?: VideoContentFit; style?: StyleProp<ViewStyle> }) {
  const player = useVideoPlayer(source);
  const videoView = useRef<VideoView | null>(null);
  const thumbnailRequested = useRef(false);
  const [thumbnail, setThumbnail] = useState<VideoThumbnail | null>(null);

  async function playFullscreen() {
    try {
      await videoView.current?.enterFullscreen();
      player.play();
    } catch {
      // Leave playback paused if fullscreen could not be opened.
    }
  }

  function captureThumbnail() {
    if (!tapToFullscreen || Platform.OS === 'web' || thumbnailRequested.current) return;
    thumbnailRequested.current = true;
    player.generateThumbnailsAsync(0.1, { maxWidth: 640, maxHeight: 640 })
      .then(([frame]) => {
        if (frame) setThumbnail(frame);
      })
      .catch(() => {
        thumbnailRequested.current = false;
      });
  }

  const video = (
    <VideoView
      ref={videoView}
      player={player}
      style={tapToFullscreen ? StyleSheet.absoluteFill : [styles.video, compact && styles.previewMedia, style]}
      contentFit={contentFit}
      nativeControls
      pointerEvents={tapToFullscreen ? 'none' : undefined}
      surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
      fullscreenOptions={{ enable: true }}
      onFirstFrameRender={tapToFullscreen ? captureThumbnail : undefined}
      onFullscreenExit={() => {
        if (tapToFullscreen) player.pause();
      }}
    />
  );

  if (!tapToFullscreen) return video;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Play video fullscreen"
      onPress={playFullscreen}
      style={[styles.fullscreenVideoTile, compact && styles.previewMedia, style]}
    >
      {video}
      {thumbnail && (
        <ExpoImage
          pointerEvents="none"
          source={thumbnail}
          style={styles.fullscreenVideoThumbnail}
          contentFit="cover"
          contentPosition="center"
        />
      )}
      <View pointerEvents="none" style={styles.fullscreenPlayOverlay}>
        <Text style={styles.fullscreenPlayIcon}>▶</Text>
      </View>
    </Pressable>
  );
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
  fullscreenVideoTile: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  fullscreenVideoThumbnail: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    elevation: 2,
  },
  fullscreenPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenPlayIcon: {
    color: '#FFFFFF',
    fontSize: 42,
  },
  remove: {
    alignSelf: 'flex-end',
    color: Colors.textLink,
    padding: 6,
  },
});
