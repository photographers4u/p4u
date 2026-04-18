import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register";
import { getAuthSession } from "@/server/auth/session";

export default async function RegisterPage() {
  const session = await getAuthSession({ headers: await headers() });

  if (session?.user) {
    redirect("/account");
  }

  return (
    <div>
      <RegisterForm />
    </div>
  );
}
