import { headers } from "next/headers";
import { getServerAdminSession } from "@/lib/server-api";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getServerAdminSession(await headers());
  return children;
}
