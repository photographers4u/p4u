"use client";

import {
  Bookmark,
  Camera,
  Fan,
  HatGlasses,
  Images,
  Layers3,
  User as UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import type { AuthClientUser } from "@/lib/auth-client";
import { getPhotographerStatusViewModel } from "@/lib/photographer-presentation";
import type { Photographer } from "@/zod/schema/photographer";
import { NavMain } from "./nav-main";

const accountGroup = {
  label: "Account",
  items: [
    {
      title: "Account",
      url: "/account" as Route,
      icon: UserIcon,
      children: [
        {
          title: "Profile",
          url: "/account" as Route,
        },
        {
          title: "Security",
          url: "/account/security" as Route,
        },
      ],
    },
  ],
};

function getDashboardData() {
  return [
    {
      label: "Dashboard",
      items: [
        {
          title: "Saved photographers",
          url: "/dashboard/bookmarks" as Route,
          icon: Bookmark,
        },
      ],
    },
  ];
}

const adminData = [
  {
    label: "Admin",
    items: [
      {
        title: "Photographers",
        url: "/admin/photographers" as Route,
        icon: Camera,
      },
    ],
  },
];

function getPhotographerGroup(photographer: Photographer | null) {
  if (!photographer) {
    return {
      label: "Photographer",
      items: [
        {
          title: "Become Photographer",
          url: "/onboarding" as Route,
          icon: Camera,
        },
      ],
    };
  }

  const items = [
    {
      title: "Portfolio",
      url: "/dashboard/portfolio" as Route,
      icon: Camera,
    },
  ];
  const photographerStatus = getPhotographerStatusViewModel(photographer);

  if (photographerStatus.canManageOfferings) {
    items.push({
      title: "Offerings",
      url: "/dashboard/offerings" as Route,
      icon: Layers3,
    });
    items.push({
      title: "Images",
      url: "/dashboard/images" as Route,
      icon: Images,
    });
  }

  return {
    label: "Photographer",
    items,
  };
}

export function UserSidebar({
  photographer,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  photographer: Photographer | null;
  user: AuthClientUser;
}) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin") && user.role === "admin";
  const isAccountRoute = pathname.startsWith("/account");
  const showDashboardGroups = isDashboardRoute || isAccountRoute;
  const showAdminGroups = isAdminRoute;
  const groups = [
    ...(showDashboardGroups ? getDashboardData() : []),
    ...(showDashboardGroups ? [getPhotographerGroup(photographer)] : []),
    ...(showAdminGroups ? adminData : []),
    ...(showDashboardGroups || showAdminGroups ? [accountGroup] : []),
  ];
  const showAdminFooter = user.role === "admin";
  const footerHref = (isAdminRoute ? "/dashboard" : "/admin") as Route;
  const footerLabel = isAdminRoute ? "Dashboard" : "Admin Dashboard";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-1.5">
              <Link href="/" className="flex items-center gap-2">
                <Fan className="size-5 animate-spin" />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      {showAdminFooter && (
        <SidebarFooter>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={footerLabel}
              variant="outline"
              className="border"
              asChild
            >
              <Link href={footerHref} className="flex items-center gap-2">
                <HatGlasses className="size-4" />
                <span>{footerLabel}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
