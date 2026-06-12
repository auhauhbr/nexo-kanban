import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import * as authApi from "../api/auth";
import { authTokenStorage } from "../api/client";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authTokenStorage.get()) {
      setLoading(false);
      return;
    }

    authApi
      .getCurrentUser()
      .then(setUser)
      .catch(() => authTokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const applySession = useCallback((nextUser: User, token: string) => {
    authTokenStorage.set(token);
    setUser(nextUser);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await authApi.login({ email, password });
      applySession(session.user, session.token);
    },
    [applySession]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const session = await authApi.register({ name, email, password });
      applySession(session.user, session.token);
    },
    [applySession]
  );

  const signOut = useCallback(() => {
    authTokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [loading, signIn, signOut, signUp, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
