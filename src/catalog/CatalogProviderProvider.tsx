import React, { type ReactNode } from "react";
import type { CatalogProvider } from "./catalog-provider";
import { CatalogContext } from "./catalog-context";

export interface CatalogProviderProviderProps {
  children: ReactNode;
  provider: CatalogProvider;
}

export const CatalogProviderProvider = ({
  children,
  provider,
}: CatalogProviderProviderProps) => (
  <CatalogContext.Provider value={provider}>{children}</CatalogContext.Provider>
);
