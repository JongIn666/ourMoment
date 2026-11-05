import { Colors } from '@/constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewProps } from 'react-native';

import { PostMedia } from '@/components/post-media';
import { ReactionMenu } from '@/components/reaction-menu';
import { WhiteBox } from '@/components/white-box';
import type { Media } from '@/lib/auth-api';
import { getWeatherOption } from '@/lib/weather';
import { EmojiCount } from './emoji';
import { ReactButton } from './react-button';

export type TimelinePostProps = ViewProps & {
  date: Date,
  startOfDate?: boolean,
  userIcon: ImageSourcePropType,
  excerpt: string,
  tags: Array<string>,
  emojiReacts: Array<EmojiCount>,
  commentNum: number
  isOwnPost?: boolean,
  onDelete?: () => Promise<void>,
  onEditPress?: () => void,
  onOpenPress?: () => void,
  media?: Media[],
  link?: string,
  weather?: string,
  reactionEmojis?: string[],
  reactionCounts?: Record<string, number>,
  myReactions?: string[],
  onReact?: (emoji: string) => Promise<void>,
};

export function TimelinePost({date, startOfDate, userIcon, excerpt, tags, emojiReacts, commentNum, isOwnPost = false, onDelete, onEditPress, onOpenPress, media = [], link = '', weather = '', reactionEmojis = [], reactionCounts = {}, myReactions = [], onReact} : TimelinePostProps) {
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [reactionError, setReactionError] = useState<string | null>(null);
    const dateLabel = date.toLocaleString('en-US', {month: 'short', day: 'numeric'});
    const timeLabel = date.toLocaleString('en-US', {hour12: true, hour: 'numeric', minute: '2-digit'});
    const [posterName, ...excerptLines] = excerpt.split('\n');
    const postContent = excerptLines.join('\n');

    async function handleReactionSelect(emoji: string) {
        if (!onReact) return;
        setReactionError(null);
        try {
            await onReact(emoji);
        } catch (error) {
            setReactionError(error instanceof Error ? error.message : 'Could not save your reaction.');
        }
    }
    
    return (
        <View style={styles.postContain}>
            <View style={styles.timeLabelContain}>
                { startOfDate && (
                    <View style={styles.dateAndTimeLabel}>
                        <Text style={styles.dateLabel} numberOfLines={1}>{ dateLabel }</Text>
                        <Text style={styles.timeLabel}>
                            { timeLabel }
                        </Text>
                    </View>
                )}

                { !startOfDate && (
                    <Text style={styles.timeLabel}>
                        { timeLabel }
                    </Text>
                )}

                <View style={styles.timeCircleContain}>
                    <View style={styles.timeCircle}/>
                </View>
            </View>
            <WhiteBox style={styles.post}>
                <View style={styles.postRow1}>
                    <Pressable
                        accessibilityRole={onOpenPress ? 'button' : undefined}
                        accessibilityLabel={onOpenPress ? 'Open post details' : undefined}
                        disabled={!onOpenPress}
                        onPress={onOpenPress}
                        style={styles.postIdentity}
                    >
                        <Image
                            source={userIcon}
                            style={styles.postUserIcon}
                        />
                        <Text style={styles.postText}>
                            <Text style={styles.posterName}>{posterName}</Text>
                            {postContent ? `\n${postContent}` : ''}
                        </Text>
                    </Pressable>
                    {isOwnPost && (onDelete || onEditPress) && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={showMoreActions ? 'Less post actions' : 'More post actions'}
                            onPress={() => setShowMoreActions((visible) => !visible)}
                            style={styles.moreButton}
                        >
                            <Text style={styles.moreButtonText}>{showMoreActions ? 'Less' : 'More'}</Text>
                        </Pressable>
                    )}
                </View>
                {isOwnPost && showMoreActions && (onDelete || onEditPress) && (
                    <View style={styles.moreActions}>
                        {onEditPress && (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                    setShowMoreActions(false);
                                    onEditPress();
                                }}
                                style={styles.moreButton}
                            >
                                <Text style={styles.moreButtonText}>Edit</Text>
                            </Pressable>
                        )}
                        {onDelete && (
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                    setShowMoreActions(false);
                                    setDeleteError(null);
                                    setShowDeleteConfirmation(true);
                                }}
                                style={styles.deleteButton}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </Pressable>
                        )}
                    </View>
                )}
                <View style={styles.postRowTags}>
                    {tags.map((tag, index) =>
                        <Link key={index} href="https://www.youtube.com/watch?v=2yJgwwDcgV8" style={styles.postTag}>
                            #{tag}
                        </Link>
                    )}
                </View>
                {!!link && (
                    <Pressable
                        accessibilityRole="link"
                        onPress={async () => {
                            try {
                                await Linking.openURL(link);
                            } catch {
                                Alert.alert('Could not open link', 'Please try again.');
                            }
                        }}
                    >
                        <Text numberOfLines={2} style={styles.postLink}>{link}</Text>
                    </Pressable>
                )}
                {media.length > 0 && <PostMedia compact media={media} />}
                {!!weather && <Text accessibilityLabel="Post weather" style={styles.weather}>{getWeatherOption(weather).emoji}</Text>}
                <View style={styles.postRowReact}>
                    {emojiReacts.map((emojiReact) =>
                        <ReactButton
                            key={emojiReact.emoji.name}
                            type="emoji"
                            count={emojiReact.count}
                            emoji={emojiReact.emoji}
                        />
                    )}
                    {commentNum > 0 && (
                        <ReactButton
                            type="comment"
                            count={commentNum}
                        />
                    )}
                    {Object.entries(reactionCounts).filter(([, count]) => count > 0).map(([emoji, count]) => (
                      <Pressable
                        key={emoji}
                        accessibilityRole="button"
                        accessibilityLabel={`${emoji}, ${count} reactions`}
                        onPress={() => handleReactionSelect(emoji)}
                        style={[styles.reactionCount, myReactions.includes(emoji) && styles.selectedReaction]}
                      >
                        <Text style={styles.reactionCountText}>{emoji} {count}</Text>
                      </Pressable>
                    ))}
                    <ReactionMenu
                      emojis={reactionEmojis}
                      counts={reactionCounts}
                      selectedEmojis={myReactions}
                      onSelect={handleReactionSelect}
                    />
                </View>
                  {reactionError && <Text accessibilityRole="alert" style={styles.deleteError}>{reactionError}</Text>}
            </WhiteBox>
            <Modal
                animationType="fade"
                transparent
                visible={showDeleteConfirmation}
                onRequestClose={() => {
                  if (!isDeleting) setShowDeleteConfirmation(false);
                }}
            >
                <View style={styles.confirmationOverlay}>
                    <View accessibilityRole="alert" style={styles.confirmationDialog}>
                        <Text style={styles.confirmationTitle}>Delete this post?</Text>
                        <Text style={styles.confirmationMessage}>This post will be permanently deleted.</Text>
                        {deleteError && <Text accessibilityRole="alert" style={styles.deleteError}>{deleteError}</Text>}
                        <View style={styles.confirmationActions}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={isDeleting}
                                onPress={() => setShowDeleteConfirmation(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                disabled={isDeleting}
                                onPress={async () => {
                                    if (!onDelete) return;
                                    setIsDeleting(true);
                                    setDeleteError(null);
                                    try {
                                        await onDelete();
                                        setShowDeleteConfirmation(false);
                                    } catch (error) {
                                        setDeleteError(error instanceof Error ? error.message : 'Could not delete this post.');
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                style={styles.confirmDeleteButton}
                            >
                                <Text style={styles.confirmDeleteButtonText}>{isDeleting ? 'Deleting…' : 'Delete'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
  timeLabelContain: {
    position: 'relative',
    right: 90,
    top: 55,
    width: 80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5
  },
  dateAndTimeLabel: {
    position: 'relative',
    bottom: 7,
    alignItems: 'center'
  },
  dateLabel: {
    color: Colors.label,
    fontSize: 16
  },
  timeLabel: {
    color: Colors.label,
    fontSize: 10
  },
  timeCircleContain: {
    width: 30,
    height: 25,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeCircle: {
    backgroundColor: Colors.timeCircle,
    width: 8,
    height: 8,
    borderRadius: 100
  },
  postsContain: {
    flexShrink: 1
  },
  postContain: {
    width: "100%"
  },
  post: {
    padding: 12,
    gap: 7
  },
  postRow1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  postIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  moreActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  moreButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moreButtonText: {
    color: Colors.textLink,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteButtonText: {
    color: '#9B2C2C',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    padding: 22,
    borderRadius: 12,
    backgroundColor: Colors.box.background,
  },
  confirmationTitle: {
    color: Colors.heading,
    fontSize: 20,
    fontWeight: '700',
  },
  confirmationMessage: {
    color: Colors.interface.text,
    fontSize: 15,
  },
  deleteError: {
    color: '#9B2C2C',
    fontSize: 14,
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: Colors.interface.text,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#9B2C2C',
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  postText: {
    fontSize: 14,
    flex: 1
  },
  posterName: {
    color: Colors.heading,
    fontWeight: '700',
  },
  postUserIcon: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  postRowTags: {
    flexDirection: 'row',
    gap: 4
  },
  postTag: {
    color: Colors.interface.text
  },
  postLink: {
    color: Colors.textLink,
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  weather: {
    alignSelf: 'flex-start',
    fontSize: 20,
  },
  postRowReact: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8
  },
  reactionCount: {
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: Colors.interface.box,
  },
  selectedReaction: {
    borderWidth: 1,
    borderColor: Colors.button.primary.border,
  },
  reactionCountText: {
    fontSize: 14,
  },
});
