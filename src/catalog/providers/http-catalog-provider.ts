import type { CatalogProvider } from "../catalog-provider";
import { createCatalogRequester, type CatalogHttpOptions } from "../catalog-http";
import {
  normalizeAlbum,
  normalizeArtistDetail,
  normalizeCatalogHome,
  normalizeCatalogSearchResult,
  normalizeGenre,
  normalizeGenreDetail,
  normalizePlaylist,
  normalizeTrack,
  unwrapCatalogPayload,
} from "../catalog-normalizers";
import type {
  CatalogAlbum,
  CatalogArtistDetail,
  CatalogGenre,
  CatalogGenreDetail,
  CatalogHome,
  CatalogPlaylist,
  CatalogRequestOptions,
  CatalogSearchFilters,
  CatalogSearchResult,
  CatalogTrack,
} from "../catalog.types";

interface HttpCatalogProviderOptions extends CatalogHttpOptions {
  providerId: string;
}

const requireEntity = <T extends { id: string }>(entity: T, providerId: string, entityName: string): T => {
  if (!entity.id) {
    throw new Error(`${providerId} provider returned an invalid ${entityName}`);
  }
  return entity;
};

const entityPath = (entity: string, id: string): string =>
  `/catalog/${entity}/${encodeURIComponent(id)}`;

const buildSearchPath = (query: string, filters?: CatalogSearchFilters): string => {
  const params = new URLSearchParams();
  if (query.trim()) {
    params.set("q", query.trim());
  }
  if (filters?.types?.length) {
    params.set("types", filters.types.join(","));
  }
  if (filters?.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }
  const serialized = params.toString();
  return serialized ? `/catalog/search?${serialized}` : "/catalog/search";
};

export const createHttpCatalogProvider = (
  options: HttpCatalogProviderOptions,
): CatalogProvider => {
  const request = createCatalogRequester(options);

  return {
    id: options.providerId,

    async getHome(requestOptions?: CatalogRequestOptions): Promise<CatalogHome> {
      return normalizeCatalogHome(
        await request<unknown>("/catalog/home", requestOptions),
        options.providerId,
      );
    },

    async search(
      query: string,
      filters?: CatalogSearchFilters,
      requestOptions?: CatalogRequestOptions,
    ): Promise<CatalogSearchResult> {
      return normalizeCatalogSearchResult(
        await request<unknown>(buildSearchPath(query, filters), requestOptions),
        options.providerId,
      );
    },

    async getTrack(id: string, requestOptions?: CatalogRequestOptions): Promise<CatalogTrack> {
      const track = normalizeTrack(
        unwrapCatalogPayload(await request<unknown>(entityPath("tracks", id), requestOptions)),
        options.providerId,
      );
      return requireEntity(track, options.providerId, "track");
    },

    async getAlbum(id: string, requestOptions?: CatalogRequestOptions): Promise<CatalogAlbum> {
      const album = normalizeAlbum(
        unwrapCatalogPayload(await request<unknown>(entityPath("albums", id), requestOptions)),
        options.providerId,
      );
      return requireEntity(album, options.providerId, "album");
    },

    async getArtist(
      id: string,
      requestOptions?: CatalogRequestOptions,
    ): Promise<CatalogArtistDetail> {
      const artist = normalizeArtistDetail(
        unwrapCatalogPayload(await request<unknown>(entityPath("artists", id), requestOptions)),
        options.providerId,
      );
      return requireEntity(artist, options.providerId, "artist");
    },

    async getPlaylist(
      id: string,
      requestOptions?: CatalogRequestOptions,
    ): Promise<CatalogPlaylist> {
      const playlist = normalizePlaylist(
        unwrapCatalogPayload(await request<unknown>(entityPath("playlists", id), requestOptions)),
        options.providerId,
      );
      return requireEntity(playlist, options.providerId, "playlist");
    },

    async getGenre(
      id: string,
      requestOptions?: CatalogRequestOptions,
    ): Promise<CatalogGenreDetail> {
      const genre = normalizeGenreDetail(
        unwrapCatalogPayload(await request<unknown>(entityPath("genres", id), requestOptions)),
        options.providerId,
      );
      return requireEntity(genre, options.providerId, "genre");
    },

    async getGenres(requestOptions?: CatalogRequestOptions): Promise<CatalogGenre[]> {
      const payload = await request<unknown>("/catalog/genres", requestOptions);
      const value = unwrapCatalogPayload(payload);
      const items = Array.isArray(value)
        ? value
        : Array.isArray((value as { genres?: unknown[] } | null)?.genres)
          ? (value as { genres: unknown[] }).genres
          : [];
      return items
        .map((genre) => normalizeGenre(genre, options.providerId))
        .filter((genre): genre is CatalogGenre => genre !== null);
    },
  };
};
