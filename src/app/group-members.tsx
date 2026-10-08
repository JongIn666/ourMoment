import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { WhiteBox } from '@/components/white-box';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function GroupMembers() {
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { token } = useAuth();
  const [group, setGroup] = useState<authApi.UserGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const id = Number(groupId);
      if (!token || !Number.isInteger(id) || id <= 0) {
        setError('This group could not be found.');
        setIsLoading(false);
        return () => {
          isActive = false;
        };
      }

      setIsLoading(true);
      setError(null);
      authApi.getGroup(token, id)
        .then((currentGroup) => {
          if (isActive) setGroup(currentGroup);
        })
        .catch((caughtError: unknown) => {
          if (isActive) {
            setError(caughtError instanceof Error ? caughtError.message : 'Could not load group members.');
          }
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [groupId, token]),
  );

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.screen}>
        <BackButtonView />
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>GROUP MEMBERS</Text>
          <Text style={styles.title}>{group?.name ?? 'Members'}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.heading} />
        ) : error ? (
          <Text style={styles.stateText}>{error}</Text>
        ) : group?.members.length ? (
          <ScrollView contentContainerStyle={styles.memberList}>
            {group.members.map((member) => {
              const age = member.profile.birthday ? calculateAge(member.profile.birthday) : null;
              const details = [
                member.profile.showBirthday && member.profile.birthday
                  ? new Date(`${member.profile.birthday}T00:00:00`).toLocaleDateString('en-US', { dateStyle: 'long' })
                  : null,
                member.profile.showAge && age !== null ? `${getAgeEmoji(age)} ${age} years old` : null,
              ].filter(Boolean);

              return (
                <WhiteBox key={member.id} style={styles.memberRow}>
                  <Image
                    source={require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
                    style={styles.avatar}
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.displayName} numberOfLines={1}>
                      {member.profile.displayName}
                    </Text>
                    <Text style={styles.username} numberOfLines={1}>@{member.username}</Text>
                    {member.profile.bio.trim().length > 0 && (
                      <Text style={styles.bio}>{member.profile.bio}</Text>
                    )}
                    {details.length > 0 && <Text style={styles.birthday}>{details.join(' · ')}</Text>}
                  </View>
                </WhiteBox>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.stateText}>No members found.</Text>
        )}
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

function calculateAge(birthday: string) {
  const birthDate = new Date(`${birthday}T00:00:00`);
  if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

function getAgeEmoji(age: number) {
  if (age <= 12) return '🧸';
  if (age <= 19) return '🎓';
  if (age <= 45) return '💪';
  return '🧓';
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'stretch',
    gap: 12,
  },
  heading: {
    gap: 3,
    paddingBottom: 4,
  },
  eyebrow: {
    color: Colors.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: Colors.heading,
    fontSize: 26,
    fontWeight: '700',
  },
  memberList: {
    gap: 12,
    paddingBottom: 20,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.box.border,
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  displayName: {
    color: Colors.heading,
    fontSize: 18,
    fontWeight: '600',
  },
  username: {
    color: Colors.interface.text,
    fontSize: 14,
  },
  bio: {
    color: Colors.interface.text,
    fontSize: 14,
    marginTop: 4,
  },
  birthday: {
    color: Colors.interface.text,
    fontSize: 13,
    marginTop: 2,
  },
  stateText: {
    alignSelf: 'stretch',
    color: Colors.interface.text,
    textAlign: 'center',
  },
});
