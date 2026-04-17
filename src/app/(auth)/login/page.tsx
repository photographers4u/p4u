import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login";
import { getSafeAuthCallbackUrl } from "@/lib/auth-redirect";
import { getServerSession } from "@/lib/server-api";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeAuthCallbackUrl(getFirstValue(params.callbackUrl));
  const session = await getServerSession(await headers());

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div>
      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
