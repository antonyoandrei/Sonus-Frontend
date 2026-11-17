import { sonusApiClient } from "../api/runtime-api-client";
import type { CatalogPlaylist } from "../catalog/catalog.types";
import {
  normalizeLikedPlaylists,
  normalizePersonalPlaylists,
} from "../personal/personal-normalizers";
import type {
  AccessTokenGetter,
  CreatePlaylistInput,
} from "../personal/personal.types";

export const getAllPlaylistsByUserId = async (
  userId: string,
  getToken: AccessTokenGetter,
): Promise<CatalogPlaylist[]> => {
  const payload = await sonusApiClient.requestJson<unknown>(
    `/playlist/user/${encodeURIComponent(userId)}`,
    { token: await getToken() },
  );
  return normalizePersonalPlaylists(payload);
};

export const createPlaylistByUserId = async (
  playlist: CreatePlaylistInput,
  userId: string,
  token: string,
): Promise<CatalogPlaylist> => {
  const payload = await sonusApiClient.requestJson<unknown>(
    `/playlist/${encodeURIComponent(userId)}`,
    {
      method: "POST",
      token,
      body: {
        name: playlist.title,
        cover: playlist.coverUrl,
      },
    },
  );
  return normalizePersonalPlaylists([payload])[0];
};

export const deletePlaylist = async (
  token: string,
  playlistId: string,
): Promise<void> => {
  await sonusApiClient.requestJson(`/playlist/${encodeURIComponent(playlistId)}`, {
    method: "DELETE",
    token,
  });
};

export const updateUserLikes = async (
  userId: string,
  playlistId: string,
  isLiked: boolean,
  token?: string,
): Promise<void> => {
  await sonusApiClient.requestJson(
    `/playlist/${encodeURIComponent(userId)}/${encodeURIComponent(playlistId)}`,
    {
      method: isLiked ? "POST" : "DELETE",
      token,
      body: isLiked ? { playlistId } : undefined,
    },
  );
};

export const getLikedPlaylistsByUserId = async (
  userId: string,
  getToken: AccessTokenGetter,
): Promise<CatalogPlaylist[]> => {
  const payload = await sonusApiClient.requestJson<unknown>(
    `/playlist/${encodeURIComponent(userId)}/likedPlaylists`,
    { token: await getToken() },
  );
  return normalizeLikedPlaylists(payload);
};

export const likePlaylist = async (
  userId: string,
  playlistId: string,
  getToken: AccessTokenGetter,
): Promise<void> => {
  await updateUserLikes(userId, playlistId, true, await getToken());
};

export const unlikePlaylist = async (
  userId: string,
  playlistId: string,
  token?: string,
): Promise<void> => {
  await updateUserLikes(userId, playlistId, false, token);
};

export const addSongToPlaylist = async (
  playlistId: string,
  trackId: string | undefined,
  userId: string,
  token: string,
): Promise<void> => {
  if (!trackId) {
    throw new Error("Track id is required");
  }
  await sonusApiClient.requestJson(`/playlist/${encodeURIComponent(playlistId)}`, {
    method: "PATCH",
    token,
    body: { songId: trackId, userId },
  });
};

export const deleteSongFromPlaylist = async (
  playlistId: string,
  trackId: string,
  token: string,
): Promise<void> => {
  await sonusApiClient.requestJson(
    `/playlist/song/${encodeURIComponent(playlistId)}/${encodeURIComponent(trackId)}`,
    { method: "DELETE", token },
  );
};
