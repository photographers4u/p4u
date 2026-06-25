"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { formatPhotographerCountry } from "@/lib/photographer-presentation";
import { CITIES, EXPERIENCE_YEARS } from "@/zod/helpers";
import { updatePhotographerProfileSchema } from "@/zod/schema/photographer";
import { useAdminPhotographerEditMode } from "./admin-photographer-edit-mode";

const profileFormSchema = updatePhotographerProfileSchema.pick({
  bio: true,
  experienceYears: true,
  instagramReelUrl: true,
  locationCity: true,
  name: true,
  youtubeVideoUrl: true,
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileEntry = {
  bio: string | null;
  experienceYears: (typeof EXPERIENCE_YEARS)[number] | null;
  instagramReelUrl: string | null;
  locationCity: (typeof CITIES)[number] | null;
  locationCountry: string;
  name: string | null;
  youtubeVideoUrl: string | null;
};

function toFormValues(entry: ProfileEntry): ProfileFormValues {
  return {
    name: entry.name ?? "",
    bio: entry.bio ?? "",
    instagramReelUrl: entry.instagramReelUrl ?? "",
    youtubeVideoUrl: entry.youtubeVideoUrl ?? "",
    locationCity: entry.locationCity ?? undefined,
    experienceYears: entry.experienceYears ?? undefined,
  };
}

export function AdminPhotographerProfileSection({
  entry,
  photographerId,
}: {
  entry: ProfileEntry;
  photographerId: string;
}) {
  const isEditing = useAdminPhotographerEditMode();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toFormValues(entry),
    mode: "onSubmit",
  });

  const {
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const nameId = useId();
  const bioId = useId();
  const instagramId = useId();
  const youtubeId = useId();
  const experienceId = useId();
  const cityId = useId();

  const experienceYears = form.watch("experienceYears");
  const locationCity = form.watch("locationCity");

  async function onSubmit(values: ProfileFormValues) {
    const response = await apiClient.admin.photographers[":id"].profile.$patch({
      param: { id: photographerId },
      json: values,
    });
    const { errorMessage } = await readApiResponse(response);

    if (!response.ok) {
      toast.error(errorMessage ?? "Couldn't update the profile.");
      return;
    }

    toast.success("Profile updated.");
    form.reset(values);
    router.refresh();
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="rounded-[1.75rem] border border-border/60 bg-muted/10 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Bio
          </p>
          <p className="mt-3 text-sm leading-7 text-foreground">
            {entry.bio?.trim() ? entry.bio : "No bio has been added yet."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              City
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {entry.locationCity ?? "Not added yet"}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Country
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {formatPhotographerCountry(entry.locationCountry)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Instagram Reel
            </p>
            {entry.instagramReelUrl ? (
              <a
                href={entry.instagramReelUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
              >
                Open link
                <ExternalLink className="size-4" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No Instagram Reel has been added yet.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              YouTube Video
            </p>
            {entry.youtubeVideoUrl ? (
              <a
                href={entry.youtubeVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
              >
                Open link
                <ExternalLink className="size-4" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No YouTube video has been added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <FieldContent>
          <Input
            id={nameId}
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
        </FieldContent>
        <FieldErrorComponent errors={errors.name ? [errors.name] : []} />
      </Field>

      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor={bioId}>Bio</FieldLabel>
        <FieldContent>
          <Textarea
            id={bioId}
            rows={6}
            disabled={isSubmitting}
            aria-invalid={!!errors.bio}
            {...form.register("bio")}
          />
        </FieldContent>
        <FieldErrorComponent errors={errors.bio ? [errors.bio] : []} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.locationCity}>
          <FieldLabel htmlFor={cityId}>City</FieldLabel>
          <FieldContent>
            <Select
              value={locationCity || undefined}
              onValueChange={(value) => {
                form.setValue(
                  "locationCity",
                  value as (typeof CITIES)[number],
                  { shouldDirty: true },
                );
                form.clearErrors("locationCity");
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id={cityId} className="w-full">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          <FieldErrorComponent
            errors={errors.locationCity ? [errors.locationCity] : []}
          />
        </Field>

        <Field data-invalid={!!errors.experienceYears}>
          <FieldLabel htmlFor={experienceId}>Experience years</FieldLabel>
          <FieldContent>
            <Select
              value={experienceYears || undefined}
              onValueChange={(value) => {
                form.setValue(
                  "experienceYears",
                  value as (typeof EXPERIENCE_YEARS)[number],
                  { shouldDirty: true },
                );
                form.clearErrors("experienceYears");
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id={experienceId} className="w-full">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year} {year === "1" ? "year" : "years"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
          <FieldErrorComponent
            errors={errors.experienceYears ? [errors.experienceYears] : []}
          />
        </Field>
      </div>

      <Field data-invalid={!!errors.instagramReelUrl}>
        <FieldLabel htmlFor={instagramId}>Instagram Reel link</FieldLabel>
        <FieldContent>
          <Input
            id={instagramId}
            type="url"
            placeholder="https://www.instagram.com/reel/..."
            disabled={isSubmitting}
            aria-invalid={!!errors.instagramReelUrl}
            {...form.register("instagramReelUrl")}
          />
        </FieldContent>
        <FieldErrorComponent
          errors={errors.instagramReelUrl ? [errors.instagramReelUrl] : []}
        />
      </Field>

      <Field data-invalid={!!errors.youtubeVideoUrl}>
        <FieldLabel htmlFor={youtubeId}>YouTube video link</FieldLabel>
        <FieldContent>
          <Input
            id={youtubeId}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isSubmitting}
            aria-invalid={!!errors.youtubeVideoUrl}
            {...form.register("youtubeVideoUrl")}
          />
        </FieldContent>
        <FieldErrorComponent
          errors={errors.youtubeVideoUrl ? [errors.youtubeVideoUrl] : []}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting || !isDirty} size="sm">
        {isSubmitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
