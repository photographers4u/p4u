"use client";

import { Bookmark, Menu, Search, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import type { AuthClientSession } from "@/lib/auth-client";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { poppins } from "@/lib/fonts";
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

function isActivePath(pathname: string, href: Route) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopActions({ session }: { session: AuthClientSession | null }) {
  if (session?.user) {
    return (
      <>
        <Button asChild size="lg">
          <Link href="/dashboard/bookmarks">Dashboard</Link>
        </Button>
        <Button asChild size="icon-lg" variant="outline">
          <Link href="/account" aria-label="Account">
            <User />
          </Link>
        </Button>
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

function MobileMenu({ session }: { session: AuthClientSession | null }) {
  const nav = getNav(session);
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[86vw] max-w-sm border-l px-0">
        <SheetHeader className="border-b px-5 pb-5">
          <SheetTitle className={`text-base ${poppins.className}`}>
            {siteConfig.shortName}
          </SheetTitle>
          <SheetDescription>
            Browse live photographers or jump into your workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col px-5 py-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Explore
            </p>
            <div className="grid gap-2">
              {nav.map((item) => (
                <SheetClose asChild key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "default" }),
                      "justify-start text-sm",
                      isActivePath(pathname, item.href) &&
                        "bg-muted text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Account
            </p>

            {session?.user ? (
              <div className="grid gap-2">
                <SheetClose asChild>
                  <Link
                    href="/dashboard/bookmarks"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "justify-center",
                    )}
                  >
                    Dashboard
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/account"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "justify-center",
                    )}
                  >
                    Account
                  </Link>
                </SheetClose>
              </div>
            ) : (
              <div className="grid gap-2">
                <SheetClose asChild>
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "justify-center",
                    )}
                  >
                    Get started
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "justify-center",
                    )}
                  >
                    Log In
                  </Link>
                </SheetClose>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Navbar({ session }: { session: AuthClientSession | null }) {
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
            <DesktopActions session={session} />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Button
              asChild
              type="button"
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-zinc-600"
              aria-label="Search photographers"
            >
              <Link href="/photographers">
                <Search />
              </Link>
            </Button>
            <Button
              asChild
              type="button"
              size="icon-sm"
              variant="ghost"
              className="rounded-full text-zinc-600"
              aria-label="Saved photographers"
            >
              <Link
                href={
                  (session?.user
                    ? "/dashboard/bookmarks"
                    : buildAuthRedirectPath("/login", {
                        callbackUrl: "/dashboard/bookmarks",
                      })) as Route
                }
              >
                <Bookmark />
              </Link>
            </Button>
          </div>

          <MobileMenu session={session} />
        </div>
      </nav>
    </header>
  );
}

export { Navbar };
export default Navbar;
