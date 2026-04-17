"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
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
import { CITIES, EXPERIENCE_YEARS } from "@/zod/helpers";
import { type Photographer, updatePhotographerSchema } from "@/zod/schema";
import { AvatarUploadField } from "../avatar-upload-field";

const profileSchema = updatePhotographerSchema.pick({
  avatar: true,
  bio: true,
  experienceYears: true,
  locationCity: true,
  name: true,
});

type ProfileUpdateFormValues = z.infer<typeof profileSchema>;

function toProfileFormValues(
  profile: Pick<
    Photographer,
    "avatar" | "bio" | "experienceYears" | "locationCity" | "name"
  >,
): ProfileUpdateFormValues {
  return {
    avatar: profile.avatar || "",
    name: profile.name || "",
    bio: profile.bio || "",
    locationCity: profile.locationCity || "Pune",
    experienceYears: profile.experienceYears || "1",
  };
}

export function PhotographerProfileUpdateForm({
  canSubmit = true,
  profile,
}: {
  canSubmit?: boolean;
  profile: Photographer;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileFormValues(profile),
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isDirty, isSubmitting: isSaving },
  } = form;

  const avatarId = useId();
  const nameId = useId();
  const bioId = useId();
  const cityId = useId();
  const experienceId = useId();

  const isBusy = isSaving || isRefreshing;
  const isInteractionDisabled = isBusy || !canSubmit;
  const canSave = canSubmit && isDirty;
  const avatarValue = form.watch("avatar");
  const experienceYears = form.watch("experienceYears");
  const locationCity = form.watch("locationCity");

  async function onSubmit(values: ProfileUpdateFormValues) {
    if (!canSubmit || !form.formState.isDirty) {
      return;
    }

    const response = await apiClient.photographer.$patch({
      json: values,
    });
    const { errorMessage, payload } = await readApiResponse<Photographer>(
      response,
    );

    if (!response.ok) {
      toast.error(
        errorMessage ?? "Couldn't update photographer profile.",
      );
      return;
    }

    const nextProfile = payload as Photographer | null;

    if (!nextProfile) {
      toast.error("The photographer profile response was incomplete.");
      return;
    }

    form.reset(toProfileFormValues(nextProfile));
    toast.success("Photographer profile updated successfully.");
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <Field data-invalid={!!errors.avatar}>
        <FieldLabel htmlFor={avatarId}>Profile photo</FieldLabel>
        <FieldContent className="max-w-40">
          <AvatarUploadField
            inputId={avatarId}
            value={avatarValue || ""}
            disabled={isInteractionDisabled}
            previewAlt="Photographer avatar preview"
            uploadKind="photographerAvatar"
            onChange={(value) => {
              form.setValue("avatar", value, {
                shouldDirty: true,
              });
              form.clearErrors("avatar");
            }}
          />
        </FieldContent>
        {!errors.avatar ? (
          <FieldDescription>
            Upload a clear profile photo so clients can recognize you quickly.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent errors={errors.avatar ? [errors.avatar] : []} />
      </Field>

      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <FieldContent>
          <Input
            id={nameId}
            placeholder="Aarav Patel"
            autoComplete="name"
            autoFocus
            aria-invalid={!!errors.name}
            disabled={isInteractionDisabled}
            {...form.register("name")}
          />
        </FieldContent>
        {!errors.name ? (
          <FieldDescription>
            This is the display name clients will see on your photographer
            profile.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent errors={errors.name ? [errors.name] : []} />
      </Field>

      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor={bioId}>Bio</FieldLabel>
        <FieldContent>
          <Textarea
            id={bioId}
            rows={6}
            placeholder="Tell clients what kind of work you do and what makes your approach special."
            aria-invalid={!!errors.bio}
            disabled={isInteractionDisabled}
            {...form.register("bio")}
          />
        </FieldContent>
        {!errors.bio ? (
          <FieldDescription>
            Share your style, the kinds of shoots you take on, and what clients
            can expect from working with you.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent errors={errors.bio ? [errors.bio] : []} />
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
            disabled={isInteractionDisabled}
          >
            <SelectTrigger
              id={experienceId}
              className="w-full"
              aria-invalid={!!errors.experienceYears}
            >
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
        {!errors.experienceYears ? (
          <FieldDescription>
            Pick the option that best matches your professional photography
            experience.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent
          errors={errors.experienceYears ? [errors.experienceYears] : []}
        />
      </Field>

      <Field data-invalid={!!errors.locationCity}>
        <FieldLabel htmlFor={cityId}>City</FieldLabel>
        <FieldContent>
          <Select
            value={locationCity || undefined}
            onValueChange={(value) => {
              form.setValue("locationCity", value as (typeof CITIES)[number], {
                shouldDirty: true,
              });
              form.clearErrors("locationCity");
            }}
            disabled={isInteractionDisabled}
          >
            <SelectTrigger
              id={cityId}
              className="w-full"
              aria-invalid={!!errors.locationCity}
            >
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
        {!errors.locationCity ? (
          <FieldDescription>
            This helps clients understand where you are based and available for
            bookings.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent
          errors={errors.locationCity ? [errors.locationCity] : []}
        />
      </Field>

      {!canSubmit ? (
        <p className="text-sm text-muted-foreground">
          Profile updates are available only after your photographer profile is
          approved.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isInteractionDisabled || !canSave}
        className="w-full sm:w-auto"
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving profile...
          </span>
        ) : isRefreshing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Profile saved, refreshing...
          </span>
        ) : !canSubmit ? (
          "Profile locked until approval"
        ) : !isDirty ? (
          "No profile changes yet"
        ) : (
          "Save profile"
        )}
      </Button>
    </form>
  );
}
