import { headers } from "next/headers";
import { AdminSidebar } from "@/components/sidebar/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getAdminAuthSession } from "@/server/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminAuthSession({ headers: await headers() });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={session.user} />
      <SidebarInset>
        <div className="flex h-14 items-center gap-3 border-b border-border/70 px-4 sm:px-6">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Admin console</span>
        </div>
        <div className="flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
