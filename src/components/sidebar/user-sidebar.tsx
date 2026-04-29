"use client";

import {
  Bookmark,
  Camera,
  Compass,
  Fan,
  HatGlasses,
  House,
  Images,
  Layers3,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
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
import { NavMain, SidebarCTA } from "./nav-main";

type SidebarGroupData = {
  label: string;
  cta?: React.ReactNode;
  items: React.ComponentProps<typeof NavMain>["items"];
};

const exploreGroup: SidebarGroupData = {
  label: "Explore",
  cta: (
    <SidebarCTA
      href="/photographers"
      label="Browse photographers"
      icon={Compass}
      variant="outline"
    />
  ),
  items: [
    {
      title: "Home",
      url: "/" as Route,
      icon: House,
    },
    {
      title: "All photographers",
      url: "/photographers" as Route,
      icon: Compass,
    },
  ],
};

const accountGroup: SidebarGroupData = {
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

function getDashboardData(): SidebarGroupData {
  return {
    label: "Dashboard",
    items: [
      {
        title: "Saved photographers",
        url: "/dashboard/bookmarks" as Route,
        icon: Bookmark,
      },
    ],
  };
}

const adminGroup: SidebarGroupData = {
  label: "Admin",
  cta: (
    <SidebarCTA
      href="/admin/photographers"
      label="Open review queue"
      icon={ShieldCheck}
    />
  ),
  items: [
    {
      title: "Photographers",
      url: "/admin/photographers" as Route,
      icon: Camera,
    },
  ],
};

function getPhotographerGroup(
  photographer: Photographer | null,
): SidebarGroupData {
  if (!photographer) {
    return {
      label: "Photographer",
      cta: (
        <SidebarCTA
          href="/onboarding"
          label="Become a photographer"
          icon={Camera}
        />
      ),
      items: [
        {
          title: "Start onboarding",
          url: "/onboarding" as Route,
          icon: Camera,
        },
      ],
    };
  }

  const photographerStatus = getPhotographerStatusViewModel(photographer);
  const primaryPhotographerRoute = photographerStatus.shouldRedirectOnboardingToPortfolio
    ? ("/dashboard/portfolio" as Route)
    : ("/onboarding" as Route);
  const primaryPhotographerLabel = photographerStatus.shouldRedirectOnboardingToPortfolio
    ? "Manage photographer profile"
    : "Complete onboarding";
  const items = [
    {
      title: primaryPhotographerLabel,
      url: primaryPhotographerRoute,
      icon: Camera,
    },
  ];

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
    cta: (
      <SidebarCTA
        href={primaryPhotographerRoute}
        label={primaryPhotographerLabel}
        icon={Camera}
      />
    ),
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
  const groups: SidebarGroupData[] = [
    exploreGroup,
    getDashboardData(),
    getPhotographerGroup(photographer),
    ...(user.role === "admin" ? [adminGroup] : []),
    accountGroup,
  ];

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
          <NavMain
            key={group.label}
            label={group.label}
            cta={group.cta}
            items={group.items}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip="Open the public photographer directory"
            variant="outline"
            className="border"
            asChild
          >
            <Link href="/photographers" className="flex items-center gap-2">
              <Compass className="size-4" />
              <span>Public directory</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {user.role === "admin" ? (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Open the admin review queue"
              variant="outline"
              className="border"
              asChild
            >
              <Link href="/admin/photographers" className="flex items-center gap-2">
                <HatGlasses className="size-4" />
                <span>Admin review queue</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
