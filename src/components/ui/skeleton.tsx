import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative isolate overflow-hidden rounded-md bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 animate-shimmer",
          "bg-linear-to-r from-transparent via-white/60 to-transparent",
          "dark:via-white/10",
          "motion-reduce:hidden",
        )}
      />
    </div>
  )
}

export { Skeleton }
