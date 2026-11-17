import { ApiClient } from "./api-client";

export const sonusApiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL,
  retries: 1,
});
