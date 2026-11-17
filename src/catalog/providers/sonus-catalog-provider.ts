import type { CatalogProvider } from "../catalog-provider";
import { createHttpCatalogProvider } from "./http-catalog-provider";

export interface SonusCatalogProviderOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
}

export const createSonusCatalogProvider = (
  options: SonusCatalogProviderOptions,
): CatalogProvider =>
  createHttpCatalogProvider({
    ...options,
    providerId: "sonus",
  });
