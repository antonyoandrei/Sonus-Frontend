import type { CatalogPlaylist } from "../catalog/catalog.types";

export type AccessTokenGetter = () => Promise<string>;

export interface SonusUser {
  id: string;
  publicId: string;
  handle: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  isPublic: boolean;
  playlists: CatalogPlaylist[];
  followedUserIds: string[];
  followedByIds: string[];
}

export interface CreateSonusUserInput {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export interface UpdateSonusUserInput {
  name: string;
  handle: string;
  bio: string;
  isPublic: boolean;
}

export interface CreatePlaylistInput {
  title: string;
  coverUrl: string;
}
