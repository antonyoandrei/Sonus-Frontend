import { createCatalogConfig } from "./catalog-config";

describe("catalog configuration", () => {
  it("defaults to the Sonus provider and strips trailing slashes", () => {
    const config = createCatalogConfig({
      VITE_API_URL: "https://api.example/",
    });

    expect(config.provider).toBe("sonus");
    expect(config.sonusBaseUrl).toBe("https://api.example");
  });

  it("requires an allowlisted origin for the remote provider", () => {
    const config = createCatalogConfig({
      VITE_API_URL: "https://api.sonus.example",
      VITE_CATALOG_PROVIDER: "remote",
      VITE_CATALOG_REMOTE_URL: "https://catalog.example/",
      VITE_CATALOG_ALLOWED_ORIGINS: "https://catalog.example",
    });

    expect(config.provider).toBe("remote");
    expect(config.remoteBaseUrl).toBe("https://catalog.example");
  });

  it("rejects an external URL outside the build-time allowlist", () => {
    expect(() => createCatalogConfig({
      VITE_API_URL: "https://api.sonus.example",
      VITE_CATALOG_PROVIDER: "remote",
      VITE_CATALOG_REMOTE_URL: "https://catalog.example",
      VITE_CATALOG_ALLOWED_ORIGINS: "https://another.example",
    })).toThrow("not included");
  });
});
