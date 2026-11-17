export class CatalogProviderError extends Error {
  readonly providerId: string;
  readonly status: number | undefined;

  constructor(providerId: string, message: string, status?: number) {
    super(message);
    this.name = "CatalogProviderError";
    this.providerId = providerId;
    this.status = status;
  }
}
