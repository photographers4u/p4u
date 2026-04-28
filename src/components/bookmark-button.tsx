"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { useBookmarks } from "@/lib/bookmarks-context";
import { cn } from "@/lib/utils";
import type { BookmarkIdentifier } from "@/zod/schema/bookmark";

type BookmarkButtonProps = {
  identifier: BookmarkIdentifier;
  value: string;
  className?: string;
  label?: string;
  activeLabel?: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

function BookmarkButtonFallback({
  className,
  label = "Save photographer",
  size = "icon",
}: Pick<BookmarkButtonProps, "className" | "label" | "size">) {
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn("rounded-full", className)}
      disabled
      aria-label={label}
    >
      <Heart />
    </Button>
  );
}

function BookmarkButtonContent({
  identifier,
  value,
  className,
  label = "Save photographer",
  activeLabel = "Saved photographer",
  size = "icon",
}: BookmarkButtonProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoaded, isBookmarked, isPending, toggleBookmark } =
    useBookmarks();

  const bookmarked = isBookmarked(identifier, value);
  const pending = isPending(identifier, value) || !isLoaded;
  const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const loginHref = buildAuthRedirectPath("/login", {
    callbackUrl,
  });

  async function handleClick() {
    if (!isLoaded) {
      return;
    }

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
      className={cn(
        "rounded-full",
        bookmarked ? "text-pink-600" : "",
        className,
      )}
      onClick={handleClick}
      disabled={pending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? activeLabel : label}
    >
      <Heart className={cn(bookmarked ? "fill-current" : "")} />
      {size !== "icon" && size !== "icon-sm" && size !== "icon-lg"
        ? bookmarked
          ? activeLabel
          : label
        : null}
    </Button>
  );
}

export function BookmarkButton(props: BookmarkButtonProps) {
  return (
    <Suspense
      fallback={
        <BookmarkButtonFallback
          className={props.className}
          label={props.label}
          size={props.size}
        />
      }
    >
      <BookmarkButtonContent {...props} />
    </Suspense>
  );
}
