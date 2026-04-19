import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login";
import { getSafeAuthCallbackUrl } from "@/lib/auth-redirect";
import { getSearchParamFirstValue } from "@/lib/search-params";
import { getAuthSession } from "@/server/auth/session";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeAuthCallbackUrl(
    getSearchParamFirstValue(params.callbackUrl),
  );
  const session = await getAuthSession({ headers: await headers() });

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
