import { ApiClient, ApiError, joinApiUrl } from "../api/api-client";
import { CatalogProviderError } from "./catalog-error";
import type { CatalogRequestOptions } from "./catalog.types";

export interface CatalogHttpOptions {
  baseUrl: string;
  providerId: string;
  fetchImpl?: typeof fetch;
  retries?: number;
  cacheTtlMs?: number;
}

export const joinCatalogUrl = joinApiUrl;

export type CatalogRequester = <T>(
  path: string,
  requestOptions?: CatalogRequestOptions,
) => Promise<T>;

const isAbortError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: unknown }).name === "AbortError";

export const createCatalogRequester = (
  options: CatalogHttpOptions,
): CatalogRequester => {
  const client = new ApiClient({
    baseUrl: options.baseUrl,
    fetchImpl: options.fetchImpl,
    retries: options.retries ?? 1,
    cacheTtlMs: options.cacheTtlMs ?? 30_000,
  });

  return async <T>(
    path: string,
    requestOptions: CatalogRequestOptions = {},
  ): Promise<T> => {
    try {
      return await client.requestJson<T>(path, {
        signal: requestOptions.signal,
        bypassCache: requestOptions.bypassCache,
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }
      if (error instanceof ApiError) {
        throw new CatalogProviderError(
          options.providerId,
          error.message,
          error.status ?? undefined,
        );
      }
      const message = error instanceof Error ? error.message : "Network request failed";
      throw new CatalogProviderError(options.providerId, message);
    }
  };
};

export const requestCatalogJson = async <T>(
  options: CatalogHttpOptions,
  path: string,
  requestOptions: CatalogRequestOptions = {},
): Promise<T> => {
  return createCatalogRequester(options)<T>(path, requestOptions);
};
