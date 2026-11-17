export type ApiHttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  retries?: number;
  retryDelayMs?: number;
  cacheTtlMs?: number;
  maxCacheEntries?: number;
}

export interface ApiRequestOptions {
  method?: ApiHttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | object | null;
  token?: string;
  signal?: AbortSignal;
  retries?: number;
  cacheTtlMs?: number;
  bypassCache?: boolean;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

export class ApiError extends Error {
  readonly status: number | null;
  readonly payload: unknown;

  constructor(message: string, status: number | null = null, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const joinApiUrl = (baseUrl: string, path: string): string => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBaseUrl}/${normalizedPath}`;
};

const isAbortError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  (error as { name?: unknown }).name === "AbortError";

const waitForRetry = (delayMs: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("The operation was aborted", "AbortError"));
      return;
    }

    const timeoutId = window.setTimeout(resolve, delayMs);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("The operation was aborted", "AbortError"));
      },
      { once: true },
    );
  });

const serializeBody = (
  body: ApiRequestOptions["body"],
): { body: BodyInit | null | undefined; isJson: boolean } => {
  if (body === undefined || body === null) {
    return { body, isJson: false };
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return { body, isJson: false };
  }

  return { body: JSON.stringify(body), isJson: true };
};

const parseResponseBody = (body: string): unknown => {
  if (!body.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
};

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly retries: number;
  private readonly retryDelayMs: number;
  private readonly cacheTtlMs: number;
  private readonly maxCacheEntries: number;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.retries = Math.max(0, options.retries ?? 1);
    this.retryDelayMs = Math.max(0, options.retryDelayMs ?? 150);
    this.cacheTtlMs = Math.max(0, options.cacheTtlMs ?? 0);
    this.maxCacheEntries = Math.max(1, options.maxCacheEntries ?? 60);
  }

  clearCache(): void {
    this.cache.clear();
  }

  async requestJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const url = joinApiUrl(this.baseUrl, path);
    const cacheTtlMs = Math.max(0, options.cacheTtlMs ?? this.cacheTtlMs);
    const canCache = method === "GET" && !options.token && cacheTtlMs > 0;
    const cacheKey = `${method}:${url}`;

    if (canCache && !options.bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cached);
        return cached.value as T;
      }
      if (cached) {
        this.cache.delete(cacheKey);
      }

      const pending = this.inFlight.get(cacheKey);
      if (pending) {
        return pending as Promise<T>;
      }
    }

    const request = this.execute<T>(url, options).then((value) => {
      if (canCache) {
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, {
          expiresAt: Date.now() + cacheTtlMs,
          value,
        });
        while (this.cache.size > this.maxCacheEntries) {
          const oldestKey = this.cache.keys().next().value as string | undefined;
          if (!oldestKey) break;
          this.cache.delete(oldestKey);
        }
      }
      return value;
    });

    if (canCache) {
      this.inFlight.set(cacheKey, request);
      void request.then(
        () => this.inFlight.delete(cacheKey),
        () => this.inFlight.delete(cacheKey),
      );
    }

    return request;
  }

  private async execute<T>(url: string, options: ApiRequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const retries = Math.max(
      0,
      options.retries ?? (method === "GET" ? this.retries : 0),
    );
    const serializedBody = serializeBody(options.body);
    const headers = new Headers(options.headers);

    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    if (serializedBody.isJson && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.fetchImpl(url, {
          method,
          headers,
          body: serializedBody.body,
          signal: options.signal,
        });

        if (response.status >= 500 && attempt < retries) {
          await waitForRetry(this.retryDelayMs * (attempt + 1), options.signal);
          continue;
        }

        const payload = parseResponseBody(await response.text());
        if (!response.ok) {
          throw new ApiError(
            `Request failed with status ${response.status}`,
            response.status,
            payload,
          );
        }

        return payload as T;
      } catch (error) {
        if (isAbortError(error) || error instanceof ApiError) {
          throw error;
        }
        if (attempt >= retries) {
          const message = error instanceof Error ? error.message : "Network request failed";
          throw new ApiError(message);
        }
        await waitForRetry(this.retryDelayMs * (attempt + 1), options.signal);
      }
    }

    throw new ApiError("Request failed");
  }
}
