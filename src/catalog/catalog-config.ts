export type CatalogProviderName = "sonus" | "remote";

export interface CatalogEnvironment {
  VITE_API_URL?: string;
  VITE_CATALOG_PROVIDER?: string;
  VITE_CATALOG_REMOTE_URL?: string;
  VITE_CATALOG_ALLOWED_ORIGINS?: string;
}

export interface CatalogConfig {
  provider: CatalogProviderName;
  sonusBaseUrl: string;
  remoteBaseUrl: string | undefined;
  allowedRemoteOrigins: string[];
}

const normalizeBaseUrl = (value: string | undefined, variableName: string): string => {
  if (!value?.trim()) {
    throw new Error(`${variableName} is required to configure the catalog provider`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value.trim());
  } catch {
    throw new Error(`${variableName} must be an absolute HTTP(S) URL`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`${variableName} must use HTTP or HTTPS`);
  }

  return parsedUrl.toString().replace(/\/$/, "");
};

const parseAllowedOrigins = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const createCatalogConfig = (env: CatalogEnvironment): CatalogConfig => {
  const provider = (env.VITE_CATALOG_PROVIDER ?? "sonus").trim().toLowerCase();
  if (provider !== "sonus" && provider !== "remote") {
    throw new Error(`Unsupported catalog provider: ${provider}`);
  }

  const allowedRemoteOrigins = parseAllowedOrigins(env.VITE_CATALOG_ALLOWED_ORIGINS);
  const remoteBaseUrl = env.VITE_CATALOG_REMOTE_URL?.trim()
    ? normalizeBaseUrl(env.VITE_CATALOG_REMOTE_URL, "VITE_CATALOG_REMOTE_URL")
    : undefined;

  if (provider === "remote") {
    if (!remoteBaseUrl) {
      throw new Error("VITE_CATALOG_REMOTE_URL is required when the remote provider is selected");
    }
    if (allowedRemoteOrigins.length === 0) {
      throw new Error("VITE_CATALOG_ALLOWED_ORIGINS is required for the remote provider");
    }
    if (!allowedRemoteOrigins.includes(new URL(remoteBaseUrl).origin)) {
      throw new Error("VITE_CATALOG_REMOTE_URL is not included in VITE_CATALOG_ALLOWED_ORIGINS");
    }
  }

  return {
    provider,
    sonusBaseUrl: normalizeBaseUrl(env.VITE_API_URL, "VITE_API_URL"),
    remoteBaseUrl,
    allowedRemoteOrigins,
  };
};
