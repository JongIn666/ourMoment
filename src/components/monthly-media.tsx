import { PostVideo } from "@/components/post-media";
import { API_URL } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import type { UserPost } from "@/lib/auth-api";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function MonthlyMedia({ posts, onPostPress }: {
  posts: UserPost[];
  onPostPress: (postId: number) => void;
}) {
  const { token } = useAuth();
  const months = new Map<string, { label: string; posts: UserPost[] }>();

  for (const post of [...posts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )) {
    if (post.media.length === 0) continue;
    const date = new Date(post.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let month = months.get(key);
    if (!month) {
      month = {
        label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        posts: [],
      };
      months.set(key, month);
    }
    month.posts.push(post);
  }

  if (months.size === 0) {
    return <Text style={styles.empty}>No images or videos to display.</Text>;
  }

  return (
    <View style={styles.months}>
      {Array.from(months, ([key, month]) => (
        <View key={key} style={styles.month}>
          <Text accessibilityRole="header" style={styles.heading}>{month.label}</Text>
          <View style={styles.grid}>
            {month.posts.flatMap((post) => post.media.map((media) => {
              const source = {
                uri: media.url,
                ...(token && media.url.startsWith(`${API_URL}/api/media/`) ? {
                  headers: {
                    Authorization: `Token ${token}`,
                    "ngrok-skip-browser-warning": "true",
                  },
                } : {}),
              };

              return media.type === "video" ? (
                <View key={media.id} style={styles.tile}>
                  <PostVideo source={source} tapToFullscreen contentFit="cover" />
                </View>
              ) : (
                <Pressable
                  key={media.id}
                  accessibilityRole="button"
                  accessibilityLabel="Open photo post"
                  onPress={() => onPostPress(post.id)}
                  style={styles.tile}
                >
                  <Image source={source} style={styles.image} resizeMode="cover" />
                </Pressable>
              );
            }))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  months: {
    gap: 24,
  },
  month: {
    gap: 10,
  },
  heading: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: "2%",
    rowGap: 8,
  },
  tile: {
    width: "32%",
    aspectRatio: 1,
    overflow: "hidden",
    backgroundColor: "#202020",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    color: Colors.interface.text,
    padding: 16,
    textAlign: "center",
  },
});
