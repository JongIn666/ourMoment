import { BackButtonView } from '@/components/back-button-view';
import { PostVideo } from '@/components/post-media';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Colors } from '@/constants/theme';
import { API_URL } from '@/constants/api';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';
import { getWeatherOption } from '@/lib/weather';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function getMediaSource(media: authApi.Media, token: string | null) {
  return {
    uri: media.url,
    ...(token && media.url.startsWith(`${API_URL}/api/media/`) ? {
      headers: { Authorization: `Token ${token}`, 'ngrok-skip-browser-warning': 'true' },
    } : {}),
  };
}

export default function PostDetail() {
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { token } = useAuth();
  const { width, height } = useWindowDimensions();
  const [post, setPost] = useState<authApi.UserPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<authApi.Media | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const id = Number(postId);
      if (!token || !Number.isInteger(id) || id <= 0) {
        setError('This post could not be found.');
        setIsLoading(false);
        return () => {
          isActive = false;
        };
      }

      setIsLoading(true);
      setError(null);
      authApi.getPost(token, id)
        .then((currentPost) => {
          if (isActive) setPost(currentPost);
        })
        .catch((caughtError: unknown) => {
          if (isActive) {
            setError(caughtError instanceof Error ? caughtError.message : 'Could not load this post.');
          }
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [postId, token]),
  );

  const postDate = post ? new Date(post.createdAt) : null;

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <View style={styles.header}>
          <BackButtonView />
          <Text style={styles.heading}>Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.heading} style={styles.status} />
        ) : error || !post ? (
          <Text accessibilityRole="alert" style={styles.message}>
            {error ?? 'This post could not be found.'}
          </Text>
        ) : (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.content}
          >
            <View style={styles.authorRow}>
              <Image
                source={post.author.profilePicUrl
                  ? { uri: post.author.profilePicUrl }
                  : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {post.author.displayName || post.author.username}
                </Text>
                <Text style={styles.date}>
                  {postDate?.toLocaleDateString()} · {postDate?.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            {!!post.content && <Text style={styles.caption}>{post.content}</Text>}

            {post.media.length > 0 && (
              <View style={styles.mediaGrid}>
                {post.media.map((media) => (
                  media.type === 'image' ? (
                    <Pressable
                      key={media.id}
                      accessibilityRole="button"
                      accessibilityLabel="Enlarge photo"
                      onPress={() => setActiveMedia(media)}
                      style={styles.mediaTile}
                    >
                      <Image source={getMediaSource(media, token)} style={styles.thumbnail} resizeMode="cover" />
                    </Pressable>
                  ) : (
                    <View key={media.id} style={styles.mediaTile}>
                      <PostVideo
                        source={getMediaSource(media, token)}
                        tapToFullscreen
                        contentFit="cover"
                      />
                    </View>
                  )
                ))}
              </View>
            )}

            {!!post.link && (
              <Pressable
                accessibilityRole="link"
                onPress={() => Linking.openURL(post.link).catch(() => setError('Could not open this link.'))}
              >
                <Text style={styles.link}>{post.link}</Text>
              </Pressable>
            )}

            {!!post.weather && (
              <Text accessibilityLabel={`Weather: ${getWeatherOption(post.weather).label}`} style={styles.weather}>
                {getWeatherOption(post.weather).emoji}
              </Text>
            )}

            {Object.entries(post.reactionCounts ?? {}).some(([, count]) => count > 0) && (
              <View style={styles.reactions}>
                {Object.entries(post.reactionCounts)
                  .filter(([, count]) => count > 0)
                  .map(([emoji, count]) => (
                    <Text key={emoji} style={styles.reaction}>{emoji} {count}</Text>
                  ))}
              </View>
            )}
          </ScrollView>
        )}

        <Modal
          visible={activeMedia !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveMedia(null)}
        >
          <View style={styles.viewer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close media viewer"
              onPress={() => setActiveMedia(null)}
              style={styles.viewerClose}
            >
              <Text style={styles.viewerCloseText}>×</Text>
            </Pressable>
            {activeMedia?.type === 'image' && (
              <Image
                source={getMediaSource(activeMedia, token)}
                style={{ width: width, height: height * 0.85 }}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  heading: {
    color: Colors.heading,
    fontSize: 22,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
  },
  status: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  message: {
    color: Colors.interface.text,
    padding: 18,
  },
  content: {
    flexGrow: 1,
    alignSelf: 'stretch',
    gap: 16,
    padding: 14,
    paddingBottom: 32,
    borderWidth: 2,
    borderColor: Colors.box.border,
    backgroundColor: Colors.box.background,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  authorInfo: {
    flex: 1,
    gap: 3,
  },
  authorName: {
    color: Colors.heading,
    fontSize: 17,
    fontWeight: '700',
  },
  date: {
    color: Colors.interface.text,
    fontSize: 13,
  },
  caption: {
    color: '#000000',
    fontSize: 17,
    lineHeight: 25,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaTile: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#202020',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  link: {
    color: Colors.textLink,
    textDecorationLine: 'underline',
  },
  weather: {
    fontSize: 28,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reaction: {
    color: Colors.interface.text,
    fontSize: 15,
  },
  viewer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    zIndex: 2,
    top: 48,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  viewerCloseText: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 38,
  },
});
