import { SafeAreaViewThemed } from "@/components/safe-area-themed";
import { useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
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

        <Text style={styles.heading}>Settings</Text>

        <LoginButton text="Log out" type="secondary" onPress={handleLogOut} />
      </SafeAreaViewThemed>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    alignSelf: "flex-start",
    color: Colors.heading,
    fontSize: 24,
  },
});
