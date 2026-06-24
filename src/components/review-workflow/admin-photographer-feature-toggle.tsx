"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { cn } from "@/lib/utils";

export function AdminPhotographerFeatureToggle({
  photographerId,
  isFeatured,
  size = "sm",
  className,
}: {
  photographerId: string;
  isFeatured: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);

    try {
      const response = await apiClient.photographer[":id"].feature.$patch({
        param: { id: photographerId },
        json: { isFeatured: !isFeatured },
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "We couldn't update the featured status.");
        return;
      }

      toast.success(
        isFeatured
          ? "Removed from featured photographers."
          : "Added to featured photographers.",
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={isFeatured ? "default" : "outline"}
      size={size}
      className={cn("rounded-lg", className)}
      disabled={pending}
      onClick={toggle}
    >
      <Star className={cn("size-3.5", isFeatured && "fill-current")} />
      {isFeatured ? "Featured" : "Feature"}
    </Button>
  );
}
