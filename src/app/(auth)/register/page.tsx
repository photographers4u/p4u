import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register";
import { getServerSession } from "@/lib/server-api";

export default async function RegisterPage() {
  const session = await getServerSession(await headers());

  if (session?.user) {
    redirect("/account");
  }

  return (
    <div>
      <RegisterForm />
    </div>
  );
}
