import type { CatalogProvider } from "./catalog-provider";
import { createCatalogConfig, type CatalogEnvironment } from "./catalog-config";
import { getCatalogConfig } from "./catalog-runtime-config";
import { createRemoteCatalogProvider } from "./providers/remote-catalog-provider";
import { createSonusCatalogProvider } from "./providers/sonus-catalog-provider";

export const createCatalogProvider = (
  env?: CatalogEnvironment,
): CatalogProvider => {
  const config = env ? createCatalogConfig(env) : getCatalogConfig();

  if (config.provider === "remote") {
    return createRemoteCatalogProvider({
      baseUrl: config.remoteBaseUrl as string,
    });
  }

  return createSonusCatalogProvider({
    baseUrl: config.sonusBaseUrl,
  });
};
