import React, {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SonusUser, UpdateSonusUserInput } from "../personal/personal.types";
import type { ProfileRow } from "../services/user.service";
import { authContext } from "./auth-context";
import type { AuthContextValue, SignUpInput, SignUpResult } from "./auth.types";
import { getPasswordValidationError } from "./auth.utils";
import { createDemoHandle } from "./demo-auth.utils";

const DEMO_STORAGE_KEY = "sonus.showcase.identity";
const DEMO_USER_ID = "00000000-0000-4000-8000-000000000084";
const DEMO_CREATED_AT = "2026-08-25T00:00:00.000Z";

interface DemoIdentity {
  displayName: string;
  email: string;
  handle: string;
  bio: string;
  isPublic: boolean;
}

const defaultIdentity: DemoIdentity = {
  displayName: "Oyente Sonus",
  email: "demo@sonus.local",
  handle: "oyente_sonus",
  bio: "",
  isPublic: true,
};

const delay = (milliseconds = 420): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const readIdentity = (): DemoIdentity => {
  if (typeof window === "undefined") {
    return defaultIdentity;
  }

  try {
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (!stored) {
      return defaultIdentity;
    }

    const parsed = JSON.parse(stored) as Partial<DemoIdentity>;
    if (!parsed.displayName || !parsed.email || !parsed.handle) {
      return defaultIdentity;
    }

    return {
      displayName: parsed.displayName,
      email: parsed.email,
      handle: parsed.handle,
      bio: typeof parsed.bio === "string" ? parsed.bio : defaultIdentity.bio,
      isPublic: typeof parsed.isPublic === "boolean" ? parsed.isPublic : defaultIdentity.isPublic,
    };
  } catch {
    return defaultIdentity;
  }
};

const storeIdentity = (identity: DemoIdentity): void => {
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(identity));
};

const createDemoUser = (identity: DemoIdentity): User => ({
  id: DEMO_USER_ID,
  app_metadata: { provider: "demo", providers: ["demo"] },
  user_metadata: { display_name: identity.displayName },
  aud: "authenticated",
  confirmation_sent_at: DEMO_CREATED_AT,
  confirmed_at: DEMO_CREATED_AT,
  created_at: DEMO_CREATED_AT,
  email: identity.email,
  email_confirmed_at: DEMO_CREATED_AT,
  identities: [],
  is_anonymous: false,
  role: "authenticated",
  updated_at: DEMO_CREATED_AT,
});

const createDemoProfile = (identity: DemoIdentity): ProfileRow => ({
  id: DEMO_USER_ID,
  public_id: "sonus-showcase-listener",
  handle: identity.handle,
  display_name: identity.displayName,
  bio: identity.bio || null,
  avatar_path: null,
  avatar_url: null,
  is_public: identity.isPublic,
  created_at: DEMO_CREATED_AT,
  updated_at: DEMO_CREATED_AT,
});

const createDemoSession = (user: User): Session => ({
  access_token: "sonus-demo-local-session",
  expires_in: 31_536_000,
  expires_at: 4_102_444_800,
  refresh_token: "sonus-demo-local-refresh",
  token_type: "bearer",
  user,
});

const createDemoSonusUser = (identity: DemoIdentity): SonusUser => ({
  id: DEMO_USER_ID,
  publicId: "sonus-showcase-listener",
  handle: identity.handle,
  name: identity.displayName,
  email: identity.email,
  bio: identity.bio,
  avatar: "",
  isPublic: identity.isPublic,
  playlists: [],
  followedUserIds: [],
  followedByIds: [],
});

export const DemoAuthProvider = ({ children }: { children: ReactNode }) => {
  const [identity, setIdentity] = useState<DemoIdentity>(readIdentity);
  const user = useMemo(() => createDemoUser(identity), [identity]);
  const profile = useMemo(() => createDemoProfile(identity), [identity]);
  const session = useMemo(() => createDemoSession(user), [user]);

  const updateIdentity = useCallback((nextIdentity: DemoIdentity): void => {
    setIdentity(nextIdentity);
    storeIdentity(nextIdentity);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email.includes("@") || password.length < 8) {
      throw new Error("Invalid login credentials");
    }

    await delay();
    updateIdentity({ ...defaultIdentity, email: email.trim().toLowerCase() });
  }, [updateIdentity]);

  const signUp = useCallback(async (input: SignUpInput): Promise<SignUpResult> => {
    const passwordError = getPasswordValidationError(input.password);
    if (passwordError) {
      throw new Error(passwordError);
    }

    const displayName = input.displayName.trim();
    if (!displayName) {
      throw new Error("El nombre visible es obligatorio.");
    }

    await delay();
    updateIdentity({
      displayName,
      email: input.email.trim().toLowerCase(),
      handle: createDemoHandle(displayName),
      bio: defaultIdentity.bio,
      isPublic: defaultIdentity.isPublic,
    });
    return { requiresEmailConfirmation: false };
  }, [updateIdentity]);

  const logout = useCallback(async (): Promise<void> => {
    await delay(240);
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
    setIdentity(defaultIdentity);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<void> => {
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }
    await delay();
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<void> => {
    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      throw new Error(passwordError);
    }
    await delay();
  }, []);

  const getAccessTokenSilently = useCallback(
    async (): Promise<string> => session.access_token,
    [session.access_token],
  );

  const refreshProfile = useCallback(async (): Promise<void> => undefined, []);

  const updateProfile = useCallback(async (
    input: UpdateSonusUserInput,
  ): Promise<SonusUser> => {
    await delay(180);
    const nextIdentity: DemoIdentity = {
      ...identity,
      displayName: input.name.trim(),
      handle: input.handle.trim().toLowerCase(),
      bio: input.bio.trim(),
      isPublic: input.isPublic,
    };
    updateIdentity(nextIdentity);
    return createDemoSonusUser(nextIdentity);
  }, [identity, updateIdentity]);

  const value = useMemo<AuthContextValue>(() => ({
    authMode: "demo",
    session,
    user,
    profile,
    isAuthenticated: true,
    isLoading: false,
    isPasswordRecovery: false,
    getAccessTokenSilently,
    signIn,
    signUp,
    logout,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    refreshProfile,
  }), [
    getAccessTokenSilently,
    logout,
    profile,
    refreshProfile,
    requestPasswordReset,
    session,
    signIn,
    signUp,
    updatePassword,
    updateProfile,
    user,
  ]);

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};
