import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { LoginButton } from "@/components/login-button";
import { LoginError } from "@/components/other-login-ui";
import { GOOGLE_IOS_CLIENT_ID } from "@/constants/google";
import { useAuth } from "@/context/auth";

WebBrowser.maybeCompleteAuthSession();

export function IOSGoogleLoginButton() {
  const { signInWithGoogleCode } = useAuth();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, , promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    shouldAutoExchangeCode: false,
  });

  async function handleGooglePress() {
    if (!request || isSigningIn) return;

    setError(null);
    setIsSigningIn(true);

    try {
      const result = await promptAsync({ preferEphemeralSession: true });
      if (result.type === "cancel" || result.type === "dismiss") {
        return;
      }
      if (result.type === "error") {
        setError("Google sign-in was not completed. Please try again.");
        return;
      }
      if (result.type !== "success") return;

      const code = result.params.code;
      if (!code || !request.codeVerifier || !request.redirectUri) {
        setError(
          "Google did not return everything needed to finish sign-in. Please try again.",
        );
        return;
      }

      await signInWithGoogleCode(
        code,
        request.codeVerifier,
        request.redirectUri,
        GOOGLE_IOS_CLIENT_ID,
      );
      router.replace("/home");
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to sign in with Google.",
      );
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <View style={styles.container}>
      <LoginButton
        text="Continue with Google"
        type="secondary"
        labelStyle={styles.label}
        disabled={!request || isSigningIn}
        onPress={() => void handleGooglePress()}
      />

      {error && <LoginError>{error}</LoginError>}
    </View>
  );
}

export function GoogleLoginButton() {
  if (Platform.OS !== "ios") return null;
  return <IOSGoogleLoginButton />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 22,
  },
});
