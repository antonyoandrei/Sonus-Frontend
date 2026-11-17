import { createContext } from "react";
import type { AuthContextValue } from "./auth.types";

export const authContext = createContext<AuthContextValue | null>(null);
