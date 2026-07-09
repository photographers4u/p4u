"use client";

import { Images, Pencil, Settings, Shield, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";
import type { AuthClientSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { poppins } from "@/lib/fonts";
import type { OwnPhotographerProfileLink } from "@/lib/photographer-own-profile";
import { cn } from "@/lib/utils";

function getNav(session: AuthClientSession | null) {
  const publicNav = [
    { label: "Home", href: "/" as Route },
    { label: "Photographers", href: "/photographers" as Route },
    { label: "About", href: "/about-us" as Route },
    { label: "Contact", href: "/contact" as Route },
    { label: "Join Us", href: "/join-us" as Route },
  ];

  if (!session?.user) {
    return publicNav;
  }

  const signedInNav = [
    ...publicNav,
    { label: "Saved", href: "/dashboard/bookmarks" as Route },
  ];

  return signedInNav;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AccountMenu({
  profile,
}: {
  profile: OwnPhotographerProfileLink | null;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.replace("/") },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon-lg"
          variant="outline"
          className="overflow-hidden rounded-full p-0"
          aria-label="Account menu"
        >
          {profile?.avatarUrl ? (
            // biome-ignore lint/performance/noImgElement: photographer avatars are stored on an external host
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <UserRound />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {profile ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={profile.href as Route}>
                <UserRound />
                View profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={"/dashboard/portfolio" as Route}>
                <Pencil />
                Edit profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={"/dashboard/images" as Route}>
                <Images />
                Add work
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}

        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/security">
            <Shield />
            Security
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopActions({
  session,
  profile,
}: {
  session: AuthClientSession | null;
  profile: OwnPhotographerProfileLink | null;
}) {
  if (session?.user) {
    return (
      <>
        <Button asChild size="lg">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <NotificationBell />
        <AccountMenu profile={profile} />
      </>
    );
  }

  return (
    <>
      <Button asChild size="lg" variant="outline">
        <Link href="/login">Log In</Link>
      </Button>
      <Button asChild size="lg">
        <Link href="/register">Get started</Link>
      </Button>
    </>
  );
}

function NavbarClient({
  session,
  profile,
}: {
  session: AuthClientSession | null;
  profile: OwnPhotographerProfileLink | null;
}) {
  const nav = getNav(session);
  const pathname = usePathname();

  return (
    <header
      className={`sticky top-0 z-50 border-b border-zinc-200/60 bg-white/85 backdrop-blur-md ${poppins.className}`}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-9 border bg-blue-50/50 aspect-square overflow-hidden text-white flex relative items-center justify-center rounded-md text-sm font-semibold sm:size-10">
            <img
              src="/logo-192.png"
              alt={siteConfig.name}
              className="h-7! w-7! aspect-square absolute sm:h-8! sm:w-8!"
            />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            {siteConfig.shortName}
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:absolute md:left-1/2 md:flex md:-translate-x-1/2">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex h-12 items-center gap-2 text-sm font-medium transition",
                isActivePath(pathname, item.href)
                  ? "text-primary"
                  : "text-zinc-600 hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <DesktopActions session={session} profile={profile} />
          </div>

          {session?.user ? (
            <div className="flex items-center gap-1 md:hidden">
              <NotificationBell />
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export { NavbarClient };
