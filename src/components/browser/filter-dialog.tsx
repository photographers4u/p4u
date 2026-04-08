"use client";

import { ListFilter } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BrowserFilterDialog({
  open,
  onOpenChange,
  onOpen,
  onApply,
  activeCount,
  children,
  title = "Filters",
  triggerLabel = "Filters",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void;
  onApply: () => void;
  activeCount: number;
  children: ReactNode;
  title?: string;
  triggerLabel?: string;
}) {
  const hasActiveFilters = activeCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            buttonVariants({
              variant: hasActiveFilters ? "outline" : "ghost",
              size: "sm",
            }),
            "gap-2 px-3",
          )}
        >
          <ListFilter className="size-4 opacity-80" />
          <span>{triggerLabel}</span>
          {hasActiveFilters ? (
            <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
              {activeCount}
            </span>
          ) : null}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onApply}>Done</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
