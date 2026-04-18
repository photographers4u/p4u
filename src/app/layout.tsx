import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { BookmarkProvider } from "@/lib/bookmarks-context";
import { inter } from "@/lib/fonts";
import { siteConfig } from "@/config/site";
import { getAuthSession } from "@/server/auth/session";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = siteConfig.metadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.className, "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">
        <BookmarkProvider session={session}>{children}</BookmarkProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
