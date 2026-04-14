import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerAccount } from "@/lib/server-api";

export default async function OnboardingPage() {
  const requestHeaders = await headers();
  const account = await getServerAccount(requestHeaders);

  if (!account?.user) {
    redirect("/login");
  }

  redirect("/dashboard/portfolio");
}
