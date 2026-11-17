export type CatalogProviderId = "sonus" | "remote";

export type CatalogEntityType =
  | "track"
  | "album"
  | "artist"
  | "playlist"
  | "genre";

export interface CatalogArtist {
  id: string;
  name: string;
  imageUrl: string | null;
  providerId: string;
}

export interface CatalogGenre {
  id: string;
  name: string;
  providerId: string;
}

export interface CatalogAlbumReference {
  id: string;
  title: string;
  coverUrl: string | null;
  providerId: string;
}

export interface CatalogTrack {
  id: string;
  title: string;
  artists: CatalogArtist[];
  album: CatalogAlbumReference | null;
  coverUrl: string | null;
  streamUrl: string | null;
  durationMs: number | null;
  year: number | null;
  genres: CatalogGenre[];
  explicit: boolean;
  playCount: number;
  providerId: string;
}

export interface CatalogAlbum {
  id: string;
  title: string;
  artists: CatalogArtist[];
  coverUrl: string | null;
  tracks: CatalogTrack[];
  year: number | null;
  providerId: string;
}

export interface CatalogArtistDetail extends CatalogArtist {
  albums: CatalogAlbum[];
  tracks: CatalogTrack[];
}

export interface CatalogOwner {
  id: string;
  name: string;
}

export interface CatalogPlaylist {
  id: string;
  title: string;
  coverUrl: string | null;
  owner: CatalogOwner | null;
  tracks: CatalogTrack[];
  providerId: string;
}

export interface CatalogGenreDetail extends CatalogGenre {
  albums: CatalogAlbum[];
  artists: CatalogArtist[];
  tracks: CatalogTrack[];
}

export interface CatalogHome {
  tracks: CatalogTrack[];
  albums: CatalogAlbum[];
  artists: CatalogArtist[];
  playlists: CatalogPlaylist[];
  genres: CatalogGenre[];
}

export interface CatalogSearchFilters {
  types?: CatalogEntityType[];
  limit?: number;
}

export interface CatalogSearchResult {
  tracks: CatalogTrack[];
  albums: CatalogAlbum[];
  artists: CatalogArtist[];
  playlists: CatalogPlaylist[];
  genres: CatalogGenre[];
}

export interface CatalogRequestOptions {
  signal?: AbortSignal;
  bypassCache?: boolean;
}
