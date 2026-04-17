"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";

export function DeleteItemButton({
  itemId,
  itemTitle,
}: {
  itemId: string;
  itemTitle: string | null;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await apiClient.item[":id"].$delete({
        param: {
          id: itemId,
        },
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "Couldn't delete the item.");
        setIsDeleting(false);
        return;
      }

      toast.success("Item deleted successfully.");
      router.push("/admin");
      router.refresh();
    } catch {
      toast.error("Couldn't delete the item.");
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" type="button">
          Delete item
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemTitle || "This item"} will be removed permanently from the
            collection and from any bookmarks pointing at it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="justify-start!">
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete it"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
