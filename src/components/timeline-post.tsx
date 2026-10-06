import { Colors } from '@/constants/theme';
import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View, type ImageSourcePropType, type ViewProps } from 'react-native';

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
};

export function TimelinePost({date, startOfDate, userIcon, excerpt, tags, emojiReacts, commentNum} : TimelinePostProps) {
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