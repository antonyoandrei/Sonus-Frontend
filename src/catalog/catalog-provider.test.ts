import { CatalogProviderError } from "./catalog-error";
import { createSonusCatalogProvider } from "./providers/sonus-catalog-provider";

const responseFor = (body: unknown, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  text: jest.fn().mockResolvedValue(JSON.stringify(body)),
} as unknown as Response);

describe("catalog providers", () => {
  it("uses the normalized track endpoint and returns a normalized entity", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      responseFor({ id: "track/1", title: "Track", streamUrl: "https://cdn.example/track.mp3" }),
    ) as unknown as typeof fetch;
    const provider = createSonusCatalogProvider({
      baseUrl: "https://api.example/",
      fetchImpl,
    });

    const track = await provider.getTrack("track/1");

    expect(track).toMatchObject({
      id: "track/1",
      title: "Track",
      streamUrl: "https://cdn.example/track.mp3",
      providerId: "sonus",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/catalog/tracks/track%2F1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("serializes search filters into the provider contract", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      responseFor({ tracks: [{ id: "track-1", title: "Track" }] }),
    ) as unknown as typeof fetch;
    const provider = createSonusCatalogProvider({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    const result = await provider.search("night", { types: ["track"], limit: 5 });

    expect(result.tracks[0].title).toBe("Track");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/catalog/search?q=night&types=track&limit=5",
      expect.any(Object),
    );
  });

  it("converts non-success responses into a provider error", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(responseFor({ error: "unavailable" }, 503)) as unknown as typeof fetch;
    const provider = createSonusCatalogProvider({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    await expect(provider.getGenres()).rejects.toEqual(
      expect.objectContaining({
        name: "CatalogProviderError",
        providerId: "sonus",
        status: 503,
      } satisfies Partial<CatalogProviderError>),
    );
  });

  it("loads normalized genre details through the contract", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(
      responseFor({
        id: "genre-1",
        name: "Electronic",
        tracks: [{ id: "track-1", title: "Track" }],
      }),
    ) as unknown as typeof fetch;
    const provider = createSonusCatalogProvider({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    const genre = await provider.getGenre("genre-1");

    expect(genre.name).toBe("Electronic");
    expect(genre.tracks[0].title).toBe("Track");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/catalog/genres/genre-1",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
