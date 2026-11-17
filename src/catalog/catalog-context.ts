import { createContext } from "react";
import type { CatalogProvider } from "./catalog-provider";

export const CatalogContext = createContext<CatalogProvider | null>(null);
