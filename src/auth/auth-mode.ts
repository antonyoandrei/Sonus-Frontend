export type AuthRuntimeMode = "demo" | "supabase";

const configuredMode = import.meta.env.VITE_AUTH_MODE?.trim().toLowerCase();

export const authRuntimeMode: AuthRuntimeMode =
  configuredMode === "supabase" ? "supabase" : "demo";

