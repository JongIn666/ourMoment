import { Colors } from '@/constants/theme';
import { Link } from 'expo-router';
import { Image, Modal, Pressable, StyleSheet, Text, View, type ImageSourcePropType, type ViewProps } from 'react-native';
import { useState } from 'react';

import { WhiteBox } from '@/components/white-box';
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
};

export function TimelinePost({date, startOfDate, userIcon, excerpt, tags, emojiReacts, commentNum, isOwnPost = false, onDelete, onEditPress} : TimelinePostProps) {
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const monthLabel = date.toLocaleString('en-US', {month: 'short'});
    const dayLabel = date.toLocaleString('en-US', {day: 'numeric'});
    const timeLabel = date.toLocaleString('en-US', {hour12: true, hour: 'numeric', minute: '2-digit'});
    
    return (
        <View style={styles.postContain}>
            <View style={styles.timeLabelContain}>
                { startOfDate && (
                    <View style={styles.dateAndTimeLabel}>
                        <View style={styles.dateLabelView}>
                            <Text style={[styles.dateLabel, styles.monthLabel]}>{ monthLabel }</Text>
                            <Text style={[styles.dateLabel, styles.dayLabel]}>{ dayLabel }</Text>
                        </View>
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

                <View style={styles.timeCircle}/>
            </View>
            <WhiteBox style={styles.post}>
                <View style={styles.postRow1}>
                    <Text style={styles.postText}>
                        {excerpt}
                    </Text>
                    <Image
                        source={userIcon}
                        style={styles.postUserIcon}
                    />
                </View>
                {isOwnPost && (onDelete || onEditPress) && (
                    <View style={styles.moreActions}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="More post actions"
                            onPress={() => setShowMoreActions((visible) => !visible)}
                            style={styles.moreButton}
                        >
                            <Text style={styles.moreButtonText}>More</Text>
                        </Pressable>
                        {showMoreActions && (
                            <>
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
                            </>
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
                <View style={styles.postRowMedia}>
                    <Image
                        source={require('@/assets/images/placeholder/slendy.jpg')}
                        style={styles.postMedia}
                    />
                    <Image
                        source={require('@/assets/images/placeholder/slendy.jpg')}
                        style={styles.postMedia}
                    />
                    <Image
                        source={require('@/assets/images/placeholder/slendy.jpg')}
                        style={styles.postMedia}
                    />
                    <Image
                        source={require('@/assets/images/placeholder/slendy.jpg')}
                        style={styles.postMedia}
                    />
                </View>
                <View style={styles.postRowReact}>
                    {emojiReacts.map((emojiReact) =>
                        <ReactButton
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
                </View>
            </WhiteBox>
            <Modal
                animationType="fade"
                transparent
                visible={showDeleteConfirmation}
                onRequestClose={() => !isDeleting && setShowDeleteConfirmation(false)}
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
    right: 88,
    top: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  dateAndTimeLabel: {
    position: 'relative',
    bottom: 25
  },
  dateLabelView: {
    alignItems: 'center'
  },
  dateLabel: {
    color: Colors.label
  },
  monthLabel: {
    fontSize: 24
  },
  dayLabel: {
    fontSize: 20
  },
  timeLabel: {
    color: Colors.label,
    fontSize: 10
  },
  timeCircle: {
    backgroundColor: Colors.timeCircle,
    width: 25,
    height: 25,
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
    gap: 10
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
    flexShrink: 1
  },
  postUserIcon: {
    width: 48,
    height: 48,
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
  postRowMedia: {
    flexDirection: 'row'
  },
  postMedia: {
    width: 58,
    height: 58,
    borderWidth: 2,
    borderColor: Colors.box.border
  },
  postRowReact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: -22,
    right: 10,
    gap: 8
  }
});
