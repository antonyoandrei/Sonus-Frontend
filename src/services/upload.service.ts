import { sonusApiClient } from "../api/runtime-api-client";

interface UploadResponse {
  data?: {
    url?: string;
  };
}

export const uploadRequest = async (
  file: File | undefined,
): Promise<string | undefined> => {
  if (!file) {
    return undefined;
  }

  const formData = new FormData();
  formData.append("image", file);
  const response = await sonusApiClient.requestJson<UploadResponse>(
    "/cloudinary/image",
    { method: "POST", body: formData },
  );
  return response.data?.url;
};
