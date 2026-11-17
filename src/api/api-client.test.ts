import { ApiClient, ApiError } from "./api-client";

const responseFor = (body: unknown, status = 200): Response => ({
  ok: status >= 200 && status < 300,
  status,
  text: jest.fn().mockResolvedValue(JSON.stringify(body)),
} as unknown as Response);

describe("ApiClient", () => {
  it("deduplicates and caches GET requests", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(responseFor({ value: 1 })) as unknown as typeof fetch;
    const client = new ApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      cacheTtlMs: 30_000,
    });

    const [first, second] = await Promise.all([
      client.requestJson<{ value: number }>("/value"),
      client.requestJson<{ value: number }>("/value"),
    ]);
    const cached = await client.requestJson<{ value: number }>("/value");

    expect(first.value).toBe(1);
    expect(second.value).toBe(1);
    expect(cached.value).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries transient GET network failures", async () => {
    const fetchImpl = jest.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(responseFor({ ok: true })) as unknown as typeof fetch;
    const client = new ApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      retries: 1,
      retryDelayMs: 0,
    });

    await expect(client.requestJson("/health")).resolves.toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns a typed error for non-success responses", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(responseFor({ error: "denied" }, 403)) as unknown as typeof fetch;
    const client = new ApiClient({ baseUrl: "https://api.example", fetchImpl });

    await expect(client.requestJson("/private")).rejects.toEqual(
      expect.objectContaining({ name: "ApiError", status: 403 }) satisfies Partial<ApiError>,
    );
  });

  it("evicts the least recently used cached response", async () => {
    const fetchImpl = jest.fn()
      .mockResolvedValueOnce(responseFor({ value: "a" }))
      .mockResolvedValueOnce(responseFor({ value: "b" }))
      .mockResolvedValueOnce(responseFor({ value: "a2" })) as unknown as typeof fetch;
    const client = new ApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      cacheTtlMs: 30_000,
      maxCacheEntries: 1,
    });

    await client.requestJson("/a");
    await client.requestJson("/b");
    await expect(client.requestJson("/a")).resolves.toEqual({ value: "a2" });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
