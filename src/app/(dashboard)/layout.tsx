import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserSidebar } from "@/components/sidebar/user-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getServerPhotographer, getServerSession } from "@/lib/server-api";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const [session, photographer] = await Promise.all([
    getServerSession(requestHeaders),
    getServerPhotographer(requestHeaders),
  ]);

  if (!session || !session.user) {
    return redirect("/login");
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
      <UserSidebar
        variant="sidebar"
        user={session.user}
        photographer={photographer}
      />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground">Menu</span>
        </header>
        <div className="flex flex-1 flex-col max-w-6xl mx-auto w-full py-6 px-4 sm:py-10 sm:px-6 lg:py-16 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
