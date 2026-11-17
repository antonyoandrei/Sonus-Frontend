import { sonusApiClient } from "../api/runtime-api-client";
import type { CatalogTrack } from "../catalog/catalog.types";
import { normalizeLikedTracks } from "../personal/personal-normalizers";
import type { AccessTokenGetter } from "../personal/personal.types";

export const getLikedSongsByUserId = async (
  userId: string | undefined,
  getToken?: AccessTokenGetter,
): Promise<CatalogTrack[]> => {
  if (!userId) {
    return [];
  }
  const token = getToken ? await getToken() : undefined;
  const payload = await sonusApiClient.requestJson<unknown>(
    `/song/${encodeURIComponent(userId)}/likedSongs`,
    { token },
  );
  return normalizeLikedTracks(payload);
};

export const updateUserLikes = async (
  userId: string,
  trackId: string,
  isLiked: boolean,
  token?: string,
): Promise<void> => {
  const path = `/song/${encodeURIComponent(userId)}/${encodeURIComponent(trackId)}`;
  await sonusApiClient.requestJson(path, {
    method: isLiked ? "POST" : "DELETE",
    token,
    body: isLiked ? { trackId } : undefined,
  });
};

export const likeSong = async (
  userId: string,
  trackId: string,
  getToken: AccessTokenGetter,
): Promise<void> => {
  await updateUserLikes(userId, trackId, true, await getToken());
};

export const unlikeSong = async (
  userId: string,
  trackId: string,
  token?: string,
): Promise<void> => {
  await updateUserLikes(userId, trackId, false, token);
};
