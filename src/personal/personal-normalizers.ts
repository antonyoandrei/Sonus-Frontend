import {
  normalizeAlbum,
  normalizePlaylist,
  normalizeTrack,
} from "../catalog/catalog-normalizers";
import type {
  CatalogAlbum,
  CatalogPlaylist,
  CatalogTrack,
} from "../catalog/catalog.types";
import type { SonusUser } from "./personal.types";

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord =>
  typeof value === "object" && value !== null ? value as RawRecord : {};

const asString = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export const normalizeSonusUser = (value: unknown): SonusUser | null => {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    publicId: asString(record.publicId ?? record.public_id ?? id),
    handle: asString(record.handle ?? record.name),
    name: asString(record.name),
    email: asString(record.email),
    bio: asString(record.bio),
    avatar: asString(record.avatar),
    isPublic: record.isPublic !== false && record.is_public !== false,
    playlists: asArray(record.playlists ?? record.Playlist).map((playlist) =>
      normalizePlaylist(playlist, "sonus"),
    ),
    followedUserIds: asStringArray(record.followedUserIds ?? record.followedUserId),
    followedByIds: asStringArray(record.followedByIds ?? record.followedById),
  };
};

export const normalizeSonusUsers = (value: unknown): SonusUser[] =>
  asArray(value)
    .map(normalizeSonusUser)
    .filter((user): user is SonusUser => user !== null);

export const normalizePersonalPlaylists = (value: unknown): CatalogPlaylist[] =>
  asArray(value).map((item) => normalizePlaylist(item, "sonus"));

export const normalizeLikedTracks = (value: unknown): CatalogTrack[] =>
  asArray(value).map((item) => {
    const record = asRecord(item);
    return normalizeTrack(record.track ?? record.Song ?? item, "sonus");
  });

export const normalizeLikedAlbums = (value: unknown): CatalogAlbum[] =>
  asArray(value).map((item) => {
    const record = asRecord(item);
    return normalizeAlbum(record.album ?? record.Albums ?? item, "sonus");
  });

export const normalizeLikedPlaylists = (value: unknown): CatalogPlaylist[] =>
  asArray(value).map((item) => {
    const record = asRecord(item);
    return normalizePlaylist(record.playlist ?? record.Playlists ?? item, "sonus");
  });
