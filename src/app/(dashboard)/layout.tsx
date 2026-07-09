import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { UserSidebar } from "@/components/sidebar/user-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { isAdminPanelRole } from "@/lib/admin-role";
import { getAuthSession } from "@/server/auth/session";
import { getCurrentPhotographer } from "@/server/services/photographer";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const [session, photographer] = await Promise.all([
    getAuthSession({ headers: requestHeaders }),
    getCurrentPhotographer(requestHeaders),
  ]);

  if (!session?.user) {
    return redirect("/login");
  }

  if (isAdminPanelRole(session.user.role)) {
    return redirect("/admin");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <UserSidebar variant="sidebar" photographer={photographer} />
      <SidebarInset>
        <MobileBottomNav session={session} />
        <div className="flex flex-1 flex-col max-w-6xl mx-auto w-full py-6 px-4 sm:py-10 sm:px-6 lg:py-16 lg:px-8 max-md:pb-28">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
