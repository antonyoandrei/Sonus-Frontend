import { useCallback, useEffect, useState } from "react";
import type {
  CatalogAlbum,
  CatalogArtistDetail,
  CatalogGenreDetail,
  CatalogHome,
  CatalogPlaylist,
  CatalogRequestOptions,
  CatalogSearchResult,
} from "./catalog.types";
import { useCatalogProvider } from "./use-catalog-provider";

export type CatalogResourceStatus = "loading" | "success" | "error";

export interface CatalogResource<T> {
  data: T | null;
  error: Error | null;
  status: CatalogResourceStatus;
  reload(): void;
}

type CatalogLoader<T> = (options: CatalogRequestOptions) => Promise<T>;

const isAbortError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: unknown }).name === "AbortError";

const useCatalogResource = <T>(loader: CatalogLoader<T>): CatalogResource<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<CatalogResourceStatus>("loading");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    void loader({
      signal: controller.signal,
      bypassCache: revision > 0,
    })
      .then((result) => {
        setData(result);
        setStatus("success");
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError
            : new Error("Catalog request failed"),
        );
        setStatus("error");
      });

    return () => controller.abort();
  }, [loader, revision]);

  return {
    data,
    error,
    status,
    reload: () => setRevision((current) => current + 1),
  };
};

export const useCatalogHome = (): CatalogResource<CatalogHome> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => provider.getHome(options),
    [provider],
  );
  return useCatalogResource(loader);
};

export const useCatalogSearch = (
  query: string,
): CatalogResource<CatalogSearchResult> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => provider.search(query, undefined, options),
    [provider, query],
  );
  return useCatalogResource(loader);
};

export const useCatalogAlbum = (
  id: string | undefined,
): CatalogResource<CatalogAlbum> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => {
      if (!id) {
        return Promise.reject(new Error("Album id is required"));
      }
      return provider.getAlbum(id, options);
    },
    [id, provider],
  );
  return useCatalogResource(loader);
};

export const useCatalogArtist = (
  id: string | undefined,
): CatalogResource<CatalogArtistDetail> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => {
      if (!id) {
        return Promise.reject(new Error("Artist id is required"));
      }
      return provider.getArtist(id, options);
    },
    [id, provider],
  );
  return useCatalogResource(loader);
};

export const useCatalogGenre = (
  id: string | undefined,
): CatalogResource<CatalogGenreDetail> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => {
      if (!id) {
        return Promise.reject(new Error("Genre id is required"));
      }
      return provider.getGenre(id, options);
    },
    [id, provider],
  );
  return useCatalogResource(loader);
};

export const useCatalogPlaylist = (
  id: string | undefined,
): CatalogResource<CatalogPlaylist> => {
  const provider = useCatalogProvider();
  const loader = useCallback(
    (options: CatalogRequestOptions) => {
      if (!id) {
        return Promise.reject(new Error("Playlist id is required"));
      }
      return provider.getPlaylist(id, options);
    },
    [id, provider],
  );
  return useCatalogResource(loader);
};
