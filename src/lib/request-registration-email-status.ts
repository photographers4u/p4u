import { readApiResponse } from "@/lib/api-response";
import type { PublicRegistrationEmailStatus } from "@/server/account/email-verification";

export async function requestRegistrationEmailStatus(params: {
  email: string;
}) {
  const response = await fetch("/api/verification/register-status", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
    }),
  });
  const { errorMessage, payload } = await readApiResponse<{
    status?: PublicRegistrationEmailStatus;
  }>(response);

  return {
    errorMessage,
    ok: response.ok,
    status: payload?.status,
  };
}
