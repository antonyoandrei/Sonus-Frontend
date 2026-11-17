import { useContext } from "react";
import type { CatalogProvider } from "./catalog-provider";
import { CatalogContext } from "./catalog-context";

export const useCatalogProvider = (): CatalogProvider => {
  const provider = useContext(CatalogContext);
  if (!provider) {
    throw new Error("CatalogProviderProvider is missing from the application tree");
  }
  return provider;
};
