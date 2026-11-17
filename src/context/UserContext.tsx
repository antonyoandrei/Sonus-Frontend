import React, {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authContext } from "../auth/auth-context";
import type { SonusUser } from "../personal/personal.types";
import { userContext } from "./user-context";

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(authContext);
  const [currentUser, setCurrentUser] = useState<SonusUser | null>(null);
  const requestId = useRef(0);

  const refreshCurrentUser = useCallback(async (): Promise<void> => {
    if (auth?.authMode === "demo" && auth.profile) {
      setCurrentUser({
        id: auth.profile.id,
        publicId: auth.profile.public_id,
        handle: auth.profile.handle,
        name: auth.profile.display_name,
        email: auth.user?.email ?? "demo@sonus.local",
        bio: auth.profile.bio ?? "",
        avatar: auth.profile.avatar_url ?? "",
        isPublic: auth.profile.is_public,
        playlists: [],
        followedUserIds: [],
        followedByIds: [],
      });
      return;
    }

    const profileId = auth?.profile?.id;
    if (!profileId) {
      requestId.current += 1;
      setCurrentUser(null);
      return;
    }

    const currentRequest = ++requestId.current;
    const { getUserById } = await import("../services/user.service");
    const nextUser = await getUserById(profileId, auth.user?.email ?? "");
    if (currentRequest === requestId.current) {
      setCurrentUser(nextUser);
    }
  }, [auth?.authMode, auth?.profile, auth?.user?.email]);

  useEffect(() => {
    void refreshCurrentUser().catch((error: unknown) => {
      console.error("Could not load the current Sonus user:", error);
      setCurrentUser(null);
    });
  }, [refreshCurrentUser]);

  const replaceCurrentUser = useCallback((user: SonusUser): void => {
    requestId.current += 1;
    setCurrentUser(user);
  }, []);

  const value = useMemo(
    () => ({ currentUser, refreshCurrentUser, replaceCurrentUser }),
    [currentUser, refreshCurrentUser, replaceCurrentUser],
  );

  return (
    <userContext.Provider value={value}>{children}</userContext.Provider>
  );
};
