import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { inter } from "@/lib/fonts";
import "./globals.css";
import { cn } from "@/lib/utils";
import ClientProvider from "@/components/client-provider";

export const metadata: Metadata = siteConfig.metadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.className,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
