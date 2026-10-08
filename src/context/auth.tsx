import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '@/lib/auth-api';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/token-storage';

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: authApi.AuthUser | null;
  signIn: (identifier: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    displayName: string,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<authApi.AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    getStoredToken()
      .then(async (storedToken) => {
        if (!storedToken) return;
        const currentUser = await authApi.getCurrentUser(storedToken);
        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser);
        }
      })
      .catch(() => clearStoredToken())
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const applyAuthResponse = useCallback(async (response: { token: string; user: authApi.AuthUser }) => {
    await setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const signIn = useCallback(
    async (identifier: string, password: string) => {
      const response = await authApi.login(identifier, password);
      await applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const response = await authApi.googleLogin(idToken);
      await applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const signUp = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      confirmPassword: string,
      displayName: string,
    ) => {
      const response = await authApi.register(
        username,
        email,
        password,
        confirmPassword,
        displayName,
      );
      await applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const signOut = useCallback(async () => {
    const activeToken = token;
    setToken(null);
    setUser(null);
    await clearStoredToken();

    if (activeToken) {
      await authApi.logout(activeToken).catch(() => undefined);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      isLoading,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      token,
      user,
    }),
    [isLoading, signIn, signInWithGoogle, signOut, signUp, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
