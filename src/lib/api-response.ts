import { getApiErrorMessage } from "@/lib/api-error";

export async function readApiResponse<TPayload = unknown>(response: Response) {
  const payload = (await response.json().catch(() => null)) as TPayload | null;

  return {
    errorMessage: getApiErrorMessage(payload),
    payload,
  };
}
