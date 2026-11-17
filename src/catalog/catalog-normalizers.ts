import type {
  CatalogAlbum,
  CatalogAlbumReference,
  CatalogArtist,
  CatalogArtistDetail,
  CatalogGenre,
  CatalogGenreDetail,
  CatalogHome,
  CatalogOwner,
  CatalogPlaylist,
  CatalogSearchResult,
  CatalogTrack,
} from "./catalog.types";

type RawRecord = Record<string, unknown>;

interface TrackContext {
  artists?: CatalogArtist[];
  album?: CatalogAlbumReference | null;
  genres?: CatalogGenre[];
}

const asRecord = (value: unknown): RawRecord => {
  if (typeof value === "object" && value !== null) {
    return value as RawRecord;
  }
  return {};
};

const asString = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const asNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const asBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === "boolean" ? value : fallback;
};

const firstValue = (record: RawRecord, keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }
  return undefined;
};

const arrayValue = (record: RawRecord, keys: string[]): unknown[] => {
  const value = firstValue(record, keys);
  return Array.isArray(value) ? value : [];
};

export const unwrapCatalogPayload = (payload: unknown): unknown => {
  const record = asRecord(payload);
  return record.data ?? payload;
};

const parseDurationMs = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parts = value.trim().split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part)) || (parts.length !== 2 && parts.length !== 3)) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? Math.max(0, numericValue) : null;
  }

  if (parts.length === 2) {
    return Math.max(0, parts[0] * 60_000 + parts[1] * 1_000);
  }

  return Math.max(0, parts[0] * 3_600_000 + parts[1] * 60_000 + parts[2] * 1_000);
};

export const normalizeArtist = (
  value: unknown,
  providerId: string,
): CatalogArtist | null => {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    name: asString(firstValue(record, ["name", "title"])) ?? "Unknown artist",
    imageUrl: asString(firstValue(record, ["imageUrl", "img", "coverUrl", "cover"])),
    providerId,
  };
};

export const normalizeGenre = (
  value: unknown,
  providerId: string,
): CatalogGenre | null => {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    name: asString(firstValue(record, ["name", "title"])) ?? "Unknown genre",
    providerId,
  };
};

export const normalizeAlbumReference = (
  value: unknown,
  providerId: string,
): CatalogAlbumReference | null => {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    title: asString(firstValue(record, ["title", "name"])) ?? "Untitled album",
    coverUrl: asString(firstValue(record, ["coverUrl", "cover"])),
    providerId,
  };
};

const normalizeOwner = (value: unknown): CatalogOwner | null => {
  const record = asRecord(value);
  const id = asString(record.id);
  if (!id) {
    return null;
  }

  return {
    id,
    name: asString(firstValue(record, ["name", "title"])) ?? "Unknown user",
  };
};

export const normalizeTrack = (
  value: unknown,
  providerId: string,
  context: TrackContext = {},
): CatalogTrack => {
  const record = asRecord(unwrapCatalogPayload(value));
  const artists = arrayValue(record, ["artists", "Artist"])
    .map((artist) => normalizeArtist(artist, providerId))
    .filter((artist): artist is CatalogArtist => artist !== null);
  const albumValue = firstValue(record, ["album", "Album"]);
  const album = Array.isArray(albumValue)
    ? normalizeAlbumReference(albumValue[0], providerId)
    : normalizeAlbumReference(albumValue, providerId);

  return {
    id: asString(record.id) ?? "",
    title: asString(firstValue(record, ["title", "name"])) ?? "Untitled track",
    artists: artists.length > 0 ? artists : context.artists ?? [],
    album: album ?? context.album ?? null,
    coverUrl:
      asString(firstValue(record, ["coverUrl", "cover"])) ??
      (album ?? context.album)?.coverUrl ??
      null,
    streamUrl: asString(firstValue(record, ["streamUrl", "url"])),
    durationMs: parseDurationMs(firstValue(record, ["durationMs", "duration"])),
    year: asNumber(record.year),
    genres: arrayValue(record, ["genres", "Genres"])
      .map((genre) => normalizeGenre(genre, providerId))
      .filter((genre): genre is CatalogGenre => genre !== null)
      .concat(context.genres ?? [])
      .filter((genre, index, genres) => genres.findIndex((item) => item.id === genre.id) === index),
    explicit: asBoolean(firstValue(record, ["explicit", "isExplicit"]), false),
    playCount: Math.max(0, asNumber(firstValue(record, ["playCount", "listened"])) ?? 0),
    providerId,
  };
};

export const normalizeAlbum = (value: unknown, providerId: string): CatalogAlbum => {
  const record = asRecord(unwrapCatalogPayload(value));
  const id = asString(record.id) ?? "";
  const artists = arrayValue(record, ["artists", "Artist"])
    .map((artist) => normalizeArtist(artist, providerId))
    .filter((artist): artist is CatalogArtist => artist !== null);
  const albumReference: CatalogAlbumReference = {
    id,
    title: asString(firstValue(record, ["title", "name"])) ?? "Untitled album",
    coverUrl: asString(firstValue(record, ["coverUrl", "cover"])),
    providerId,
  };

  return {
    id,
    title: albumReference.title,
    artists,
    coverUrl: albumReference.coverUrl,
    tracks: arrayValue(record, ["tracks", "Song"]).map((track) =>
      normalizeTrack(track, providerId, { artists, album: albumReference }),
    ),
    year: asNumber(record.year),
    providerId,
  };
};

export const normalizePlaylist = (value: unknown, providerId: string): CatalogPlaylist => {
  const record = asRecord(unwrapCatalogPayload(value));
  const tracks = arrayValue(record, ["tracks", "Song"]).map((track) => normalizeTrack(track, providerId));

  return {
    id: asString(record.id) ?? "",
    title: asString(firstValue(record, ["title", "name"])) ?? "Untitled playlist",
    coverUrl: asString(firstValue(record, ["coverUrl", "cover"])),
    owner: normalizeOwner(firstValue(record, ["owner", "User"])),
    tracks,
    providerId,
  };
};

export const normalizeArtistDetail = (
  value: unknown,
  providerId: string,
): CatalogArtistDetail => {
  const record = asRecord(unwrapCatalogPayload(value));
  const artist = normalizeArtist(record, providerId);
  if (!artist) {
    return {
      id: "",
      name: "Unknown artist",
      imageUrl: null,
      albums: [],
      tracks: [],
      providerId,
    };
  }

  return {
    ...artist,
    albums: arrayValue(record, ["albums", "Albums"]).map((album) =>
      normalizeAlbum(album, providerId),
    ),
    tracks: arrayValue(record, ["tracks", "Song"]).map((track) =>
      normalizeTrack(track, providerId, { artists: [artist] }),
    ),
  };
};

export const normalizeGenreDetail = (
  value: unknown,
  providerId: string,
): CatalogGenreDetail => {
  const record = asRecord(unwrapCatalogPayload(value));
  const genre = normalizeGenre(record, providerId);
  if (!genre) {
    return {
      id: "",
      name: "Unknown genre",
      albums: [],
      artists: [],
      tracks: [],
      providerId,
    };
  }

  return {
    ...genre,
    albums: arrayValue(record, ["albums", "Albums"]).map((album) =>
      normalizeAlbum(album, providerId),
    ),
    artists: arrayValue(record, ["artists", "Artist"])
      .map((artist) => normalizeArtist(artist, providerId))
      .filter((artist): artist is CatalogArtist => artist !== null),
    tracks: arrayValue(record, ["tracks", "Song"]).map((track) =>
      normalizeTrack(track, providerId, { genres: [genre] }),
    ),
  };
};

export const normalizeCatalogHome = (payload: unknown, providerId: string): CatalogHome => {
  const record = asRecord(unwrapCatalogPayload(payload));

  return {
    tracks: arrayValue(record, ["tracks", "songs", "Song"]).map((track) =>
      normalizeTrack(track, providerId),
    ),
    albums: arrayValue(record, ["albums", "Albums"]).map((album) =>
      normalizeAlbum(album, providerId),
    ),
    artists: arrayValue(record, ["artists", "Artist"]).map((artist) =>
      normalizeArtist(artist, providerId),
    ).filter((artist): artist is CatalogArtist => artist !== null),
    playlists: arrayValue(record, ["playlists", "Playlist"]).map((playlist) =>
      normalizePlaylist(playlist, providerId),
    ),
    genres: arrayValue(record, ["genres", "Genres"]).map((genre) =>
      normalizeGenre(genre, providerId),
    ).filter((genre): genre is CatalogGenre => genre !== null),
  };
};

export const normalizeCatalogSearchResult = (
  payload: unknown,
  providerId: string,
): CatalogSearchResult => {
  const home = normalizeCatalogHome(payload, providerId);
  return {
    tracks: home.tracks,
    albums: home.albums,
    artists: home.artists,
    playlists: home.playlists,
    genres: home.genres,
  };
};
