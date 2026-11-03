import { SafeAreaViewThemed } from "@/components/safe-area-themed";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { BackButtonView } from "@/components/back-button-view";
import { LoginButton } from "@/components/login-button";
import { Colors } from "@/constants/theme";

import { useAuth } from "@/context/auth";

export default function Settings() {
  const auth = useAuth();
  const router = useRouter();

  async function handleLogOut() {
    await auth.signOut();
    router.replace("/");
  }

  return (
    <SafeAreaProvider>
      <SafeAreaViewThemed style={styles.container}>
        <BackButtonView />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Settings</Text>

          <LoginButton
            text="Edit username"
            type="primary"
            onPress={() => router.navigate("/edit-username")}
          />

          <LoginButton
            text="Edit email"
            type="primary"
            onPress={() => router.navigate("/edit-email")}
          />

          <LoginButton
            text="Edit password"
            type="primary"
            onPress={() => router.navigate("/edit-password")}
          />

          <LoginButton
            text="Edit profile picture"
            type="primary"
            onPress={() => router.navigate("/edit-profile-picture")}
            labelStyle={styles.profilePictureLabel}
          />

          <LoginButton
            text="Join from invite code"
            type="primary"
            onPress={() => router.navigate("/join-group")}
            labelStyle={styles.profilePictureLabel}
          />

          <LoginButton text="Log out" type="secondary" onPress={handleLogOut} />
        </ScrollView>
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  scrollView: {
    alignSelf: "stretch",
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
  },
  heading: {
    alignSelf: "flex-start",
    color: Colors.heading,
    fontSize: 24,
  },
  profilePictureLabel: {
    fontSize: 24,
  },
});
