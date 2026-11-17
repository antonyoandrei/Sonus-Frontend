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
} from "./catalog.types";

export interface CatalogProvider {
  readonly id: string;
  getHome(options?: CatalogRequestOptions): Promise<CatalogHome>;
  search(
    query: string,
    filters?: CatalogSearchFilters,
    options?: CatalogRequestOptions,
  ): Promise<CatalogSearchResult>;
  getTrack(id: string, options?: CatalogRequestOptions): Promise<CatalogTrack>;
  getAlbum(id: string, options?: CatalogRequestOptions): Promise<CatalogAlbum>;
  getArtist(id: string, options?: CatalogRequestOptions): Promise<CatalogArtistDetail>;
  getPlaylist(id: string, options?: CatalogRequestOptions): Promise<CatalogPlaylist>;
  getGenre(id: string, options?: CatalogRequestOptions): Promise<CatalogGenreDetail>;
  getGenres(options?: CatalogRequestOptions): Promise<CatalogGenre[]>;
}
