const DEFAULT_AUTH_CALLBACK_URL = "/account";

export function getSafeAuthCallbackUrl(callbackUrl?: string | null) {
  const normalizedValue = callbackUrl?.trim();

  if (!normalizedValue) {
    return DEFAULT_AUTH_CALLBACK_URL;
  }

  if (
    !normalizedValue.startsWith("/") ||
    normalizedValue.startsWith("//")
  ) {
    return DEFAULT_AUTH_CALLBACK_URL;
  }

  return normalizedValue;
}

export function buildAuthRedirectPath(
  path: string,
  params: Record<string, string | null | undefined>,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    searchParams.set(key, value);
  }

  const search = searchParams.toString();

  return search ? `${path}?${search}` : path;
}

export { DEFAULT_AUTH_CALLBACK_URL };
