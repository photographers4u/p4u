import { headers } from "next/headers";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
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
      <MobileBottomNav session={session} />
      <div className="max-md:pb-16">{children}</div>
      <Footer />
    </>
  );
}
