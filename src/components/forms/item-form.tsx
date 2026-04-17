"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import {
  createItemSchema,
  type Item,
  type UpdateItemInput,
} from "@/zod/schema/item";

type ItemFormValues = UpdateItemInput;

export function ItemForm({
  mode,
  item,
  cancelHref,
}: {
  mode: "create" | "edit";
  item?: Item;
  cancelHref: string;
}) {
  const titleId = useId();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      title: item?.title ?? "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ItemFormValues) {
    const response =
      mode === "create"
        ? await apiClient.item.$post({
            json: values,
          })
        : await apiClient.item[":id"].$patch({
            param: {
              id: item?.id ?? "",
            },
            json: values,
          });
    const { errorMessage, payload } = await readApiResponse<{ id: string }>(
      response,
    );

    if (!response.ok) {
      toast.error(
        errorMessage ??
          (mode === "create"
            ? "Couldn't create the item."
            : "Couldn't update the item."),
      );
      return;
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("id" in payload) ||
      typeof payload.id !== "string"
    ) {
      toast.error("The item response was incomplete.");
      return;
    }

    toast.success(
      mode === "create"
        ? "Item created successfully."
        : "Item updated successfully.",
    );

    setIsRedirecting(true);
    router.push(
      mode === "create"
        ? `/admin/items/${payload.id}/edit`
        : `/items/${payload.id}`,
    );
    router.refresh();
  }

  const isBusy = isSubmitting || isRedirecting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor={titleId}>Title</FieldLabel>
        <FieldContent>
          <Input
            id={titleId}
            placeholder="Starter item"
            autoComplete="off"
            autoFocus
            aria-invalid={!!errors.title}
            disabled={isBusy}
            {...form.register("title")}
          />
        </FieldContent>
        {!errors.title ? (
          <FieldDescription>
            Keep it short and recognizable. This title is currently the main
            item field.
          </FieldDescription>
        ) : null}
        <FieldErrorComponent errors={errors.title ? [errors.title] : []} />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isBusy}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {mode === "create" ? "Creating item..." : "Saving item..."}
            </span>
          ) : isRedirecting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Redirecting...
            </span>
          ) : mode === "create" ? (
            "Create item"
          ) : (
            "Save item"
          )}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
