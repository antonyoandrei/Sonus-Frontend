import { sonusApiClient } from "../api/runtime-api-client";
import type { CatalogAlbum } from "../catalog/catalog.types";
import { normalizeLikedAlbums } from "../personal/personal-normalizers";
import type { AccessTokenGetter } from "../personal/personal.types";

export const getLikedAlbumsByUserId = async (
  userId: string,
  getToken: AccessTokenGetter,
): Promise<CatalogAlbum[]> => {
  const payload = await sonusApiClient.requestJson<unknown>(
    `/album/${encodeURIComponent(userId)}/likedAlbums`,
    { token: await getToken() },
  );
  return normalizeLikedAlbums(payload);
};

export const updateUserLikes = async (
  userId: string,
  albumId: string,
  isLiked: boolean,
  token?: string,
): Promise<void> => {
  await sonusApiClient.requestJson(
    `/album/${encodeURIComponent(userId)}/${encodeURIComponent(albumId)}`,
    {
      method: isLiked ? "POST" : "DELETE",
      token,
      body: isLiked ? { albumId } : undefined,
    },
  );
};

export const likeAlbum = async (
  userId: string,
  albumId: string,
  getToken: AccessTokenGetter,
): Promise<void> => {
  await updateUserLikes(userId, albumId, true, await getToken());
};

export const unlikeAlbum = async (
  userId: string,
  albumId: string,
  token?: string,
): Promise<void> => {
  await updateUserLikes(userId, albumId, false, token);
};
