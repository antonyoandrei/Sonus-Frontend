import { useContext } from "react";
import { authContext } from "./auth-context";
import type { AuthContextValue } from "./auth.types";

export const useAuth = (): AuthContextValue => {
  const value = useContext(authContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
};
