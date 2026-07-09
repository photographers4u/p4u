"use client";

import { Camera, Fan, LayoutDashboard, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type * as React from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import type { AuthClientUser } from "@/lib/auth-client";
import { NavMain } from "./nav-main";

const overviewGroup = {
  label: "Overview",
  items: [
    {
      title: "Dashboard",
      url: "/admin" as Route,
      icon: LayoutDashboard,
    },
  ],
};

const photographersGroup = {
  label: "Photographers",
  items: [
    {
      title: "All photographers",
      url: "/admin/photographers" as Route,
      icon: Camera,
    },
  ],
};

const teamGroup = {
  label: "Team",
  items: [
    {
      title: "Staff accounts",
      url: "/admin/team" as Route,
      icon: Users,
    },
  ],
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  sales: "Sales",
};

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: AuthClientUser;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5">
              <Link
                href="/admin"
                onClick={handleNavigate}
                className="flex items-center gap-2"
              >
                <Fan className="size-5 animate-spin" />
                <span className="text-base font-semibold">
                  {siteConfig.name} Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain label={overviewGroup.label} items={overviewGroup.items} />
        <NavMain
          label={photographersGroup.label}
          items={photographersGroup.items}
        />
        <NavMain label={teamGroup.label} items={teamGroup.items} />
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/15 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <Badge variant="outline" className="mt-1">
              {roleLabels[user.role ?? ""] ?? "Staff"}
            </Badge>
          </div>
          <SignOutButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
