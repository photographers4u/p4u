"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AvatarUploadField } from "@/components/forms/avatar-upload-field";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { getProfileInitials } from "@/lib/photographer-presentation";
import { useAdminPhotographerEditMode } from "./admin-photographer-edit-mode";

export function AdminPhotographerAvatarSection({
  avatar,
  name,
  photographerId,
}: {
  avatar: string | null;
  name: string | null;
  photographerId: string;
}) {
  const router = useRouter();
  const isEditing = useAdminPhotographerEditMode();

  async function handleAvatarChange(value: string) {
    const response = await apiClient.admin.photographers[":id"].avatar.$patch({
      param: { id: photographerId },
      json: { avatar: value },
    });
    const { errorMessage } = await readApiResponse(response);

    if (!response.ok) {
      toast.error(errorMessage ?? "Couldn't update the avatar.");
      return;
    }

    toast.success("Avatar updated.");
    router.refresh();
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">
          Avatar <span className="text-destructive">*</span>
        </p>
        <AvatarUploadField
          value={avatar ?? ""}
          previewAlt={name ?? "Photographer avatar"}
          uploadKind="photographerAvatar"
          onChange={handleAvatarChange}
        />
      </div>
    );
  }

  return (
    <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-muted text-2xl font-semibold text-foreground/80">
      {avatar ? (
        // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
        <img
          src={avatar}
          alt={name ?? "Photographer avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        getProfileInitials(name)
      )}
    </div>
  );
}
