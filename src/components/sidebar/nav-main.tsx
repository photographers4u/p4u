"use client";

import { ChevronRight, type LucideIcon, PlusCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

function isActivePath(pathname: string, url: Route) {
  if (url === "/") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain({
  cta,
  items,
  label,
}: {
  cta?: React.ReactNode;
  label?: string;
  items: {
    title: string;
    url?: Route;
    icon?: LucideIcon;
    iconClassName?: string;
    children?: {
      title: string;
      url: Route;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}

      <SidebarGroupContent className="flex flex-col gap-2">
        {cta && <div>{cta}</div>}
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const hasActiveChild =
              item.children?.some((sub) => isActivePath(pathname, sub.url)) ??
              false;
            const isActiveItem =
              (item.url ? isActivePath(pathname, item.url) : false) ||
              hasActiveChild;

            if (item.children) {
              return (
                <Collapsible key={item.title} defaultOpen={hasActiveChild}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActiveItem}
                      >
                        {Icon && (
                          <Icon
                            className={`size-4 ${item.iconClassName ?? ""}`}
                          />
                        )}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActivePath(pathname, sub.url)}
                            >
                              <Link href={sub.url} onClick={handleNavigate}>
                                <span>{sub.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            if (!item.url) {
              return null;
            }

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActiveItem}
                  asChild
                >
                  <Link
                    href={item.url}
                    onClick={handleNavigate}
                    className="flex items-center gap-2"
                  >
                    {Icon && (
                      <Icon className={`size-4 ${item.iconClassName ?? ""}`} />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export const SidebarCTA = ({
  href,
  icon: Icon = PlusCircle,
  label,
  tooltip,
  variant = "default",
}: {
  href: Route;
  icon?: LucideIcon;
  label: string;
  tooltip?: string;
  variant?: "default" | "outline";
}) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={tooltip ?? label}
          className={
            variant === "default"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "border"
          }
          variant={variant}
          asChild
        >
          <Link
            href={href}
            onClick={handleNavigate}
            className="flex items-center gap-2"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
