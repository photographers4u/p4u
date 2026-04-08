import Link from "next/link";
import { Button } from "@/components/ui/button";

export function InternalServerState({
  description,
  href,
  actionLabel,
}: {
  description: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          System
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          INTERNAL SERVER ERROR
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      {href && actionLabel ? (
        <Button asChild variant="outline">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
