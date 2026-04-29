import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ClientProvider from "@/components/client-provider";
import { siteConfig } from "@/config/site";
import { poppins } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = siteConfig.metadata;

export default function RootLayout({
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
        poppins.className,
        "font-sans",
        poppins.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <ClientProvider>{children}</ClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
