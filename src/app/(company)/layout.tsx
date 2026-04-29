import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { getAuthSession } from "@/server/auth/session";

export default async function CompanyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <>
      <Navbar session={session} />
      {children}
      <Footer />
    </>
  );
}
