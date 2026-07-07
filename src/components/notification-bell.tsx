"use client";

import { Bell } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/lib/notifications-context";
import { cn } from "@/lib/utils";

function formatRelativeTime(iso: string) {
  const diffMinutes = Math.round(
    (Date.now() - new Date(iso).getTime()) / 60_000,
  );

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function NotificationBell({ className }: { className?: string }) {
  const { notifications, unreadCount, isLoaded, markRead, markAllRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className={cn("relative rounded-full text-zinc-600", className)}
          aria-label="Notifications"
        >
          <Bell />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Notifications
          </span>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <DropdownMenuSeparator />

        {!isLoaded ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You're all caught up.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                asChild
                className="flex-col items-start gap-0.5 whitespace-normal"
                onSelect={() => {
                  if (!item.readAt) markRead(item.id);
                }}
              >
                <Link href={(item.link ?? "/") as Route}>
                  <span className="flex w-full items-center gap-2">
                    {!item.readAt ? (
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    ) : null}
                    <span className="font-medium text-slate-900">
                      {item.title}
                    </span>
                  </span>
                  {item.body ? (
                    <span className="text-xs text-slate-500">{item.body}</span>
                  ) : null}
                  <span className="text-[11px] text-slate-400">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
