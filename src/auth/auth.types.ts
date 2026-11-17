import type { Session, User } from "@supabase/supabase-js";
import type { SonusUser, UpdateSonusUserInput } from "../personal/personal.types";
import type { ProfileRow } from "../services/user.service";
import type { AuthRuntimeMode } from "./auth-mode";

export interface SignUpInput {
  displayName: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  requiresEmailConfirmation: boolean;
}

export interface AuthContextValue {
  authMode: AuthRuntimeMode;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  getAccessTokenSilently(): Promise<string>;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<SignUpResult>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  updateProfile(input: UpdateSonusUserInput): Promise<SonusUser>;
  refreshProfile(): Promise<void>;
}
