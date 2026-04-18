"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, User } from "lucide-react";

import { siteConfig } from "@/config/site";
import Link from "next/link";
import type { Route } from "next";
import { poppins } from "@/lib/fonts";
import type { AuthClientSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function getNav(session: AuthClientSession | null) {
  const baseNav = [
    { label: "Items", href: "/items" as Route },
    { label: "Dashboard", href: "/dashboard" as Route },
  ];

  if (session?.user.role === "admin") {
    return [...baseNav, { label: "Admin", href: "/admin" as Route }];
  }

  return baseNav;
}

function DesktopActions({ session }: { session: AuthClientSession | null }) {
  if (session?.user) {
    return (
      <>
        <Button asChild size="lg">
          <Link href="/dashboard">Dashboard</Link>
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
            Browse the public library or jump into your photographer workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col px-5 py-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Explore
            </p>
            <div className="grid gap-2">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "default" }),
                    "justify-start text-sm",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Account
            </p>

            {session?.user ? (
              <div className="grid gap-2">
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "justify-center",
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/account"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "justify-center",
                  )}
                >
                  Account
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "justify-center",
                  )}
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "justify-center",
                  )}
                >
                  Log In
                </Link>
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
  return (
    <header
      className={`top-0 sticky z-50 backdrop-blur-md bg-white border-b border-zinc-200/60 ${poppins.className}`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-md text-sm font-semibold">
            {siteConfig.logo}
          </div>
          <span className="text-sm font-semibold tracking-tight">
            {siteConfig.shortName}
          </span>
        </Link>

        {/* Nav */}
        <div className="hidden items-center gap-6 md:flex md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 h-12 font-medium text-sm text-zinc-600 hover:text-primary transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <DesktopActions session={session} />
          </div>
          <MobileMenu session={session} />
        </div>
      </nav>
    </header>
  );
}

export { Navbar };
export default Navbar;
