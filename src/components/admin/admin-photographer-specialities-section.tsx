"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { cn } from "@/lib/utils";
import { useAdminPhotographerEditMode } from "./admin-photographer-edit-mode";

type SpecialityOption = {
  id: string;
  name: string;
};

type SpecialityEntry = {
  id: string;
  name: string;
  startingPrice: number;
};

export function AdminPhotographerSpecialitiesSection({
  availableSpecialities,
  photographerId,
  specialities,
}: {
  availableSpecialities: SpecialityOption[];
  photographerId: string;
  specialities: SpecialityEntry[];
}) {
  const isEditing = useAdminPhotographerEditMode();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      specialities.map((speciality) => [
        speciality.id,
        String(speciality.startingPrice),
      ]),
    ),
  );

  function toggleSpeciality(specialityId: string) {
    setSelections((current) => {
      if (specialityId in current) {
        const next = { ...current };
        delete next[specialityId];
        return next;
      }

      return { ...current, [specialityId]: "" };
    });
  }

  async function handleSave() {
    const payload = Object.entries(selections).map(
      ([specialityId, startingPrice]) => ({
        specialityId,
        startingPrice: Number(startingPrice) || 0,
      }),
    );

    setIsSaving(true);

    try {
      const response = await apiClient.admin.photographers[
        ":id"
      ].specialities.$patch({
        param: { id: photographerId },
        json: { specialities: payload },
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        toast.error(errorMessage ?? "Couldn't update specialities.");
        return;
      }

      toast.success("Specialities updated.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  if (!isEditing) {
    return specialities.length === 0 ? (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
        No specialities have been added yet.
      </div>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {specialities.map((speciality) => (
          <div
            key={speciality.id}
            className="rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-foreground">
              {speciality.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              From Rs. {speciality.startingPrice}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium text-foreground">
        Specialities <span className="text-destructive">*</span>
        <span className="ml-1 font-normal text-muted-foreground">
          (at least 1 with a starting price)
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {availableSpecialities.map((speciality) => {
          const isSelected = speciality.id in selections;

          return (
            <button
              key={speciality.id}
              type="button"
              onClick={() => toggleSpeciality(speciality.id)}
              disabled={isSaving}
              aria-pressed={isSelected}
              className={cn(
                "inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-[13px] font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
                isSelected
                  ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-muted/30 text-foreground hover:border-border/80",
              )}
            >
              {speciality.name}
            </button>
          );
        })}
      </div>

      {Object.keys(selections).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Select specialities above, then set a starting price for each.
        </p>
      ) : (
        <div className="divide-y divide-border/60 rounded-xl border border-border/60">
          {availableSpecialities
            .filter((speciality) => speciality.id in selections)
            .map((speciality) => (
              <div
                key={speciality.id}
                className="grid items-center gap-3 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_170px]"
              >
                <p className="text-sm font-medium text-foreground">
                  {speciality.name}
                </p>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    className="pl-11"
                    disabled={isSaving}
                    value={selections[speciality.id] ?? ""}
                    onChange={(event) =>
                      setSelections((current) => ({
                        ...current,
                        [speciality.id]: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      <Button type="button" size="sm" disabled={isSaving} onClick={handleSave}>
        {isSaving ? "Saving..." : "Save specialities"}
      </Button>
    </div>
  );
}
