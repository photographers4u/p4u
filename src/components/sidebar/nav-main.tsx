"use client";

import { ChevronRight, type LucideIcon, PlusCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
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
} from "@/components/ui/sidebar";

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
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}

      <SidebarGroupContent className="flex flex-col gap-2">
        {cta && <div>{cta}</div>}
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              return (
                <Collapsible key={item.title}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
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
                            <SidebarMenuSubButton asChild>
                              <Link href={sub.url}>
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
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url} className="flex items-center gap-2">
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

export const SidebarCTA = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Quick Create"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          <span>Quick Create</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
