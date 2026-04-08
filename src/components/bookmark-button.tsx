"use client";

import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/lib/bookmarks-context";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

export function BookmarkButton({
  identifier,
  value,
  className,
  label = "Bookmark",
  activeLabel = "Bookmarked",
  size = "icon",
}: {
  identifier: BookmarkIdentifier;
  value: string;
  className?: string;
  label?: string;
  activeLabel?: string;
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const router = useRouter();
  const { isAuthenticated, isLoaded, isBookmarked, isPending, toggleBookmark } =
    useBookmarks();

  const bookmarked = isBookmarked(identifier, value);
  const pending = isPending(identifier, value) || (isAuthenticated && !isLoaded);

  async function handleClick() {
    if (!isAuthenticated) {
      toast.info("Sign in to bookmark items.");
      router.push("/login");
      return;
    }

    const result = await toggleBookmark(identifier, value);

    if (result === true) {
      toast.success(`${activeLabel}.`);
    } else if (result === false) {
      toast.success(`${label} removed.`);
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
