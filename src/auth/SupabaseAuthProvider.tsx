import React, {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { SonusUser, UpdateSonusUserInput } from "../personal/personal.types";
import { getProfileRowById, updateUser, type ProfileRow } from "../services/user.service";
import { supabase } from "../supabase/client";
import { authContext } from "./auth-context";
import type { AuthContextValue, SignUpInput, SignUpResult } from "./auth.types";
import { getPasswordValidationError } from "./auth.utils";

const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const profileRequestId = useRef(0);

  const loadProfile = useCallback(async (userId: string): Promise<void> => {
    const requestId = ++profileRequestId.current;
    setIsProfileLoading(true);
    try {
      const nextProfile = await getProfileRowById(userId);
      if (!nextProfile) throw new Error("The authenticated user does not have a Sonus profile.");
      if (requestId === profileRequestId.current) setProfile(nextProfile);
    } catch (error) {
      if (requestId === profileRequestId.current) setProfile(null);
      throw error;
    } finally {
      if (requestId === profileRequestId.current) setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Could not restore the Supabase session:", error);
      setSession(data.session);
      setIsSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setIsSessionLoading(false);
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
      else if (event === "SIGNED_OUT") setIsPasswordRecovery(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) {
      profileRequestId.current += 1;
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }
    void loadProfile(userId).catch((error: unknown) => {
      console.error("Could not load the authenticated Sonus profile:", error);
    });
  }, [loadProfile, session?.user.id]);

  const getAccessTokenSilently = useCallback(async (): Promise<string> => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session?.access_token) throw new Error("No active Supabase session.");
    return data.session.access_token;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<SignUpResult> => {
    const passwordError = getPasswordValidationError(input.password);
    if (passwordError) throw new Error(passwordError);
    const displayName = input.displayName.trim();
    if (!displayName) throw new Error("El nombre visible es obligatorio.");
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: { data: { display_name: displayName }, emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw error;
    return { requiresEmailConfirmation: data.session === null };
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth?mode=recovery`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const passwordError = getPasswordValidationError(password);
    if (passwordError) throw new Error(passwordError);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setIsPasswordRecovery(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    await loadProfile(session.user.id);
  }, [loadProfile, session?.user.id]);

  const updateProfile = useCallback(async (
    input: UpdateSonusUserInput,
  ): Promise<SonusUser> => {
    const userId = session?.user.id;
    if (!userId) {
      throw new Error("No active Supabase session.");
    }

    const updated = await updateUser(userId, input);
    setProfile((current) => current?.id === userId ? {
      ...current,
      handle: updated.handle,
      display_name: updated.name,
      bio: updated.bio || null,
      is_public: updated.isPublic,
      updated_at: new Date().toISOString(),
    } : current);
    return { ...updated, email: session.user.email ?? "" };
  }, [session?.user.email, session?.user.id]);

  const value = useMemo<AuthContextValue>(() => ({
    authMode: "supabase",
    session,
    user: session?.user ?? null,
    profile,
    isAuthenticated: Boolean(session?.user),
    isLoading: isSessionLoading || isProfileLoading,
    isPasswordRecovery,
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
    isPasswordRecovery,
    isProfileLoading,
    isSessionLoading,
    logout,
    profile,
    refreshProfile,
    requestPasswordReset,
    session,
    signIn,
    signUp,
    updatePassword,
    updateProfile,
  ]);

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
};

export default SupabaseAuthProvider;
