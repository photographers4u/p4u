import { readApiResponse } from "@/lib/api-response";

export async function requestVerificationEmail(params: {
  callbackURL?: string;
  email: string;
}) {
  const response = await fetch("/api/verification/resend-email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      callbackURL: params.callbackURL,
      email: params.email,
    }),
  });
  const { errorMessage } = await readApiResponse(response);

  return {
    errorMessage,
    ok: response.ok,
  };
}
