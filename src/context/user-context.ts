import { createContext } from "react";
import type { SonusUser } from "../personal/personal.types";

export interface UserContextValue {
  currentUser: SonusUser | null;
  replaceCurrentUser(user: SonusUser): void;
  refreshCurrentUser(): Promise<void>;
}

export const userContext = createContext<UserContextValue>({
  currentUser: null,
  replaceCurrentUser: () => undefined,
  refreshCurrentUser: async () => undefined,
});
