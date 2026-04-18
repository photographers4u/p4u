import { headers } from "next/headers";
import { getAdminAuthSession } from "@/server/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getAdminAuthSession({ headers: await headers() });
  return children;
}
