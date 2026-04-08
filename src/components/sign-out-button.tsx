"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
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
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSignOut(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => router.replace("/"),
        },
      });
    } catch (_error) {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Log out</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leaving already?</AlertDialogTitle>
          <AlertDialogDescription>
            You’ll be logged out on this device. You can always come back
            anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-start!">
          <AlertDialogAction
            variant="destructive"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Logging out...
              </span>
            ) : (
              "Yes, log me out"
            )}
          </AlertDialogAction>

          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
