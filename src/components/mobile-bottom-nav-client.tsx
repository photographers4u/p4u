"use client";

import { Bookmark, Compass, Home, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthClientSession } from "@/lib/auth-client";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

type ProfileOverride = {
  label: string;
  href: string;
  matchPath: string;
  avatarUrl: string | null;
};

function isActivePath(pathname: string, matchPath: string) {
  if (matchPath === "/") {
    return pathname === matchPath;
  }

  return pathname === matchPath || pathname.startsWith(`${matchPath}/`);
}

function MobileBottomNavClient({
  session,
  profile,
}: {
  session: AuthClientSession | null;
  profile: ProfileOverride | null;
}) {
  const pathname = usePathname();
  const isAuthenticated = Boolean(session?.user);

  const tabs = [
    { label: "Home", href: "/" as Route, matchPath: "/", icon: Home },
    {
      label: "Explore",
      href: "/photographers" as Route,
      matchPath: "/photographers",
      icon: Compass,
    },
    {
      label: "Saved",
      href: (isAuthenticated
        ? "/dashboard/bookmarks"
        : buildAuthRedirectPath("/login", {
            callbackUrl: "/dashboard/bookmarks",
          })) as Route,
      matchPath: "/dashboard/bookmarks",
      icon: Bookmark,
    },
    {
      label: profile?.label ?? "Account",
      href: (profile?.href ??
        (isAuthenticated
          ? "/account"
          : buildAuthRedirectPath("/login", {
              callbackUrl: "/account",
            }))) as Route,
      matchPath: profile?.matchPath ?? "/account",
      icon: User,
      avatarUrl: profile?.avatarUrl ?? null,
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/70 bg-white/95 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {tabs.map((tab) => {
          const active = isActivePath(pathname, tab.matchPath);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.label}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium text-zinc-500 transition-colors"
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-zinc-500",
                )}
              >
                {tab.avatarUrl ? (
                  // biome-ignore lint/performance/noImgElement: photographer avatars are stored on an external host
                  <img
                    src={tab.avatarUrl}
                    alt=""
                    className={cn(
                      "size-6 rounded-full object-cover",
                      active && "ring-2 ring-primary",
                    )}
                  />
                ) : (
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                )}
              </span>
              <span className={cn(active ? "text-primary" : "text-zinc-500")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { MobileBottomNavClient };
