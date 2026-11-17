import type { CatalogProvider } from "../catalog-provider";
import { createHttpCatalogProvider } from "./http-catalog-provider";

export interface RemoteCatalogProviderOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export const createRemoteCatalogProvider = (
  options: RemoteCatalogProviderOptions,
): CatalogProvider =>
  createHttpCatalogProvider({
    ...options,
    providerId: "remote",
  });
