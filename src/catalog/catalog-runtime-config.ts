import { createCatalogConfig, type CatalogConfig } from "./catalog-config";

export const getCatalogConfig = (): CatalogConfig =>
  createCatalogConfig({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_CATALOG_PROVIDER: import.meta.env.VITE_CATALOG_PROVIDER,
    VITE_CATALOG_REMOTE_URL: import.meta.env.VITE_CATALOG_REMOTE_URL,
    VITE_CATALOG_ALLOWED_ORIGINS: import.meta.env.VITE_CATALOG_ALLOWED_ORIGINS,
  });
