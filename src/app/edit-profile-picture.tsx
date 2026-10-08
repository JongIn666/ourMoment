import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BackButtonView } from '@/components/back-button-view';
import { LoginButton } from '@/components/login-button';
import { LoginError } from '@/components/other-login-ui';
import { SafeAreaViewThemed } from '@/components/safe-area-themed';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import * as authApi from '@/lib/auth-api';

export default function EditProfilePicture() {
  const auth = useAuth();

  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(auth.token));
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!auth.token) return;

    authApi.getProfile(auth.token)
      .then((profile) => {
        if (isActive) setProfilePicUrl(profile.profilePicUrl);
      })
      .catch(() => {
        if (isActive && auth.user) setProfilePicUrl(auth.user.profile.profilePicUrl);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [auth.token, auth.user]);

  async function handleChange() {
    if (!auth.token) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo access to pick a picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      setError('Unable to read that image. Choose another picture.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const profile = await authApi.updateProfilePicture(auth.token, {
        base64: asset.base64,
        name: asset.fileName ?? 'profile-picture.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
      setProfilePicUrl(profile.profilePicUrl);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save your picture.');
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaViewThemed style={styles.loading}>
          <ActivityIndicator color={Colors.heading} />
        </SafeAreaViewThemed>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.container}>
        <BackButtonView />

        <Text style={styles.heading}>Edit profile picture</Text>

        <Image
          source={profilePicUrl
            ? { uri: profilePicUrl }
            : require('@/assets/images/placeholder/jet-the-hmmmawk.png')}
          style={styles.profilePicture}
        />

        {error && <LoginError accessibilityRole="alert">{error}</LoginError>}

        <LoginButton
          text={isUploading ? 'Saving...' : 'Change'}
          type="primary"
          disabled={isUploading || !auth.token}
          onPress={handleChange}
        />
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  loading: {
    justifyContent: 'center',
  },
  heading: {
    alignSelf: 'flex-start',
    color: Colors.heading,
    fontSize: 24,
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.box.border,
  },
});
