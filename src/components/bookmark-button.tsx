"use client";

import { Bookmark } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { useBookmarks } from "@/lib/bookmarks-context";
import { cn } from "@/lib/utils";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

export function BookmarkButton({
  identifier,
  value,
  className,
  label = "Save photographer",
  activeLabel = "Saved photographer",
  size = "icon",
}: {
  identifier: BookmarkIdentifier;
  value: string;
  className?: string;
  label?: string;
  activeLabel?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoaded, isBookmarked, isPending, toggleBookmark } =
    useBookmarks();

  const bookmarked = isBookmarked(identifier, value);
  const pending =
    isPending(identifier, value) || (isAuthenticated && !isLoaded);
  const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const loginHref = buildAuthRedirectPath("/login", {
    callbackUrl,
  });

  async function handleClick() {
    if (!isAuthenticated) {
      toast.info("Sign in to save photographers.");
      router.push(loginHref);
      return;
    }

    const result = await toggleBookmark(identifier, value);

    if (result === true) {
      toast.success(`${activeLabel}.`);
    } else if (result === false) {
      toast.success("Removed from saved photographers.");
    }
  }

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "outline"}
      size={size}
      className={cn(bookmarked ? "text-primary" : "", className)}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? activeLabel : label}
    >
      <Bookmark className={cn(bookmarked ? "fill-current" : "")} />
      {size !== "icon" && size !== "icon-sm" && size !== "icon-lg"
        ? bookmarked
          ? activeLabel
          : label
        : null}
    </Button>
  );
}
