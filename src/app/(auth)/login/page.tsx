import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login";
import { getServerSession } from "@/lib/server-api";

export default async function LoginPage() {
  const session = await getServerSession(await headers());

  if (session?.user) {
    redirect("/account");
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
