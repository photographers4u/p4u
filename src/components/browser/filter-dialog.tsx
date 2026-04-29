"use client";

import { ListFilter } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
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
  description = "Fine-tune the directory with a few quick filters.",
  triggerLabel = "Filters",
  applyLabel = "Apply filters",
  cancelLabel = "Cancel",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void;
  onApply: () => void;
  activeCount: number;
  children: ReactNode;
  title?: string;
  description?: string;
  triggerLabel?: string;
  applyLabel?: string;
  cancelLabel?: string;
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

      <AlertDialogContent className="w-[min(94vw,920px)]! max-w-[920px]! gap-0 overflow-hidden rounded-xl! border border-slate-200 bg-white p-0 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.28)]">
        <AlertDialogHeader className="place-items-start! gap-1.5 border-b border-slate-200 px-5 py-5 text-left sm:px-6 sm:py-5">
          <AlertDialogTitle className="text-lg font-semibold text-slate-950 sm:text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[min(72vh,760px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        <AlertDialogFooter className="!mx-0 !mb-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          <AlertDialogCancel className="rounded-lg border-slate-300 bg-white px-5">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction className="rounded-lg px-5" onClick={onApply}>
            {applyLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
