import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BackButtonView } from "@/components/back-button-view";
import { DateTimeFields } from "@/components/date-time-fields";
import { LoginButton } from "@/components/login-button";
import { PostMedia } from "@/components/post-media";
import { SafeAreaViewThemed } from "@/components/safe-area-themed";
import { TagPicker } from "@/components/tag-picker";
import { TextInputThemed } from "@/components/text-input-themed";
import { WeatherMenu } from "@/components/weather-menu";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth";
import { usePostMedia } from "@/hooks/use-post-media";
import * as authApi from "@/lib/auth-api";
import { parsePostLink } from "@/lib/post-link";

export default function CreatePost() {
  const router = useRouter();
  const { groupId, draftId } = useLocalSearchParams<{
    groupId?: string;
    draftId?: string;
  }>();
  const { token } = useAuth();
  const [draftPost, setDraftPost] = useState<authApi.UserPost | null>(null);
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [weather, setWeather] = useState("");
  const { media, setMedia, isPicking, mediaError, handlePickMedia } =
    usePostMedia();
  const [removedMedia, setRemovedMedia] = useState<number[]>([]);
  const [postDate, setPostDate] = useState(new Date());
  const [isLoadingDraft, setIsLoadingDraft] = useState(Boolean(draftId));
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<authApi.Tag[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);

  useEffect(() => {
    if (!draftId) return;

    let isActive = true;
    const id = Number(draftId);
    const group = Number(groupId);
    if (
      !token ||
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(group) ||
      group <= 0
    ) {
      setError("This draft could not be found.");
      setIsLoadingDraft(false);
      return () => {
        isActive = false;
      };
    }

    setIsLoadingDraft(true);
    setError(null);
    authApi
      .getPost(token, id)
      .then((post) => {
        if (!isActive) return;
        if (!post.isDraft || post.group !== group) {
          throw new Error("This draft could not be found in this group.");
        }
        setDraftPost(post);
        setContent(post.content);
        setLink(post.link);
        setWeather(post.weather ?? "");
        setTagIds(post.tags.map((tag) => tag.id));
        setPostDate(new Date(post.createdAt));
        setRemovedMedia([]);
        setMedia([]);
      })
      .catch((caughtError: unknown) => {
        if (isActive) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Could not load this draft.",
          );
        }
      })
      .finally(() => {
        if (isActive) setIsLoadingDraft(false);
      });

    return () => {
      isActive = false;
    };
  }, [draftId, groupId, token, setMedia]);

  useEffect(() => {
    const id = Number(groupId);
    if (!token || !Number.isInteger(id) || id <= 0) return;

    let isActive = true;
    authApi
      .getGroupTags(token, id)
      .then((groupTags) => {
        if (isActive) setTags(groupTags);
      })
      .catch(() => {
        if (isActive) setTags([]);
      });

    return () => {
      isActive = false;
    };
  }, [groupId, token]);

  const attachments = [
    ...(draftPost?.media ?? []).filter(
      (item) => !removedMedia.includes(item.id),
    ),
    ...media.map((asset) => ({
      id: asset.uri,
      type: asset.type === "video" ? ("video" as const) : ("image" as const),
      url: asset.uri,
    })),
  ];

  async function handleCreate(isDraft = false) {
    const id = Number(groupId);
    const trimmedContent = content.trim();
    const trimmedLink = link.trim();
    if (
      !token ||
      !Number.isInteger(id) ||
      id <= 0 ||
      isLoadingDraft ||
      (draftId && !draftPost)
    ) {
      setError("This group could not be found.");
      return;
    }
    if (
      !isDraft &&
      !trimmedContent &&
      !trimmedLink &&
      attachments.length === 0
    ) {
      setError("Write a moment or add media or a link.");
      return;
    }

    setError(null);
    setIsSaving(true);
    setIsSavingDraft(isDraft);
    try {
      const postLink = parsePostLink(trimmedLink);
      if (draftPost) {
        await authApi.updatePost(
          token,
          draftPost.id,
          trimmedContent,
          postDate.toISOString(),
          media,
          removedMedia,
          postLink,
          isDraft,
          weather,
          tagIds,
        );
      } else {
        await authApi.createPost(
          token,
          id,
          {
            content: trimmedContent,
            createdAt: postDate.toISOString(),
          },
          media,
          postLink,
          isDraft,
          weather,
          tagIds,
        );
      }
      router.dismissTo({ pathname: "/group", params: { groupId: String(id) } });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create the post.",
      );
    } finally {
      setIsSaving(false);
      setIsSavingDraft(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>{draftId ? "DRAFT" : "NEW MOMENT"}</Text>
          <Text style={styles.title}>
            {draftId ? "Continue draft" : "Create post"}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.formArea}
        >
          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <LoginButton
              text="Upload images / video"
              type="secondary"
              disabled={isLoadingDraft || isSaving || isPicking}
              onPress={handlePickMedia}
              style={styles.uploadButton}
              labelStyle={styles.uploadLabel}
            />
            {mediaError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {mediaError}
              </Text>
            )}
            {isLoadingDraft && <ActivityIndicator color={Colors.heading} />}
            {attachments.length > 0 && (
              <PostMedia
                compact
                media={attachments}
                onRemove={
                  isLoadingDraft || isSaving
                    ? undefined
                    : (id) => {
                        if (typeof id === "number") {
                          setRemovedMedia((current) => [...current, id]);
                        } else {
                          setMedia((current) =>
                            current.filter((asset) => asset.uri !== id),
                          );
                        }
                      }
                }
              />
            )}

            <Text style={styles.label}>caption</Text>
            <TextInputThemed
              autoFocus
              editable={!isLoadingDraft && !isSaving}
              maxLength={100}
              multiline
              onChangeText={setContent}
              placeholder="Write a moment for this group"
              style={styles.contentInput}
              textAlignVertical="top"
              value={content}
            />
            <Text style={styles.label}>link</Text>
            <TextInputThemed
              accessibilityLabel="External link"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoadingDraft && !isSaving && !isPicking}
              keyboardType="url"
              maxLength={2048}
              onChangeText={setLink}
              placeholder="https://example.com"
              returnKeyType="done"
              value={link}
            />

            <View style={styles.weatherSection}>
              <Text style={styles.label}>Weather</Text>
              <WeatherMenu
                value={weather}
                onChange={setWeather}
                disabled={isLoadingDraft || isSaving}
              />
            </View>

            <View style={styles.tagSection}>
              <Text style={styles.label}>Tags</Text>
              <TagPicker
                tags={tags}
                selectedIds={tagIds}
                onChange={setTagIds}
                disabled={isLoadingDraft || isSaving}
              />
            </View>

            <View style={styles.dateTimeSection}>
              <Text style={styles.label}>Post time</Text>
              <DateTimeFields value={postDate} onChange={setPostDate} />
            </View>

            {error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.actions}>
          <LoginButton
            text={isSaving && !isSavingDraft ? "Creating…" : "Create post"}
            type="primary"
            disabled={
              isLoadingDraft ||
              Boolean(draftId && !draftPost) ||
              isSaving ||
              isPicking
            }
            onPress={() => handleCreate(false)}
          />
          <LoginButton
            text={isSavingDraft ? "Saving draft…" : "Save as draft"}
            type="secondary"
            disabled={
              isLoadingDraft ||
              Boolean(draftId && !draftPost) ||
              isSaving ||
              isPicking
            }
            onPress={() => handleCreate(true)}
            style={styles.draftButton}
            labelStyle={styles.draftButtonLabel}
          />
        </View>
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "stretch",
    gap: 10,
  },
  heading: {
    gap: 2,
    paddingBottom: 8,
  },
  eyebrow: {
    color: Colors.heading,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: Colors.heading,
    fontSize: 28,
    fontWeight: "700",
  },
  formArea: {
    flex: 1,
  },
  form: {
    gap: 12,
    paddingBottom: 20,
  },
  label: {
    color: Colors.heading,
    fontSize: 16,
    fontWeight: "600",
  },
  contentInput: {
    height: 60,
  },
  uploadButton: {
    alignSelf: "flex-start",
    width: "auto",
    height: 44,
    paddingHorizontal: 12,
  },
  uploadLabel: {
    fontSize: 16,
  },
  dateTimeSection: {
    gap: 10,
    marginTop: 6,
  },
  weatherSection: {
    gap: 8,
    zIndex: 10,
  },
  tagSection: {
    gap: 8,
  },
  error: {
    color: "#9B2C2C",
    fontSize: 14,
  },
  actions: {
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  draftButton: {
    height: 52,
  },
  draftButtonLabel: {
    fontSize: 20,
  },
});
