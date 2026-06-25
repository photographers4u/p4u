"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { requiredTextSchema } from "@/zod/helpers";

type CreatePhotographerFormValues = {
  name: string;
  phone: string;
  email: string;
};

const createPhotographerFormSchema = z.object({
  name: requiredTextSchema("Name"),
  phone: requiredTextSchema("Phone"),
  email: z
    .string()
    .trim()
    .refine(
      (value) =>
        value.length === 0 || z.string().email().safeParse(value).success,
      "Enter a valid email address",
    ),
});

export function AdminCreatePhotographerDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();

  const form = useForm<CreatePhotographerFormValues>({
    resolver: zodResolver(createPhotographerFormSchema),
    defaultValues: { name: "", phone: "", email: "" },
    mode: "onSubmit",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: CreatePhotographerFormValues) {
    const response = await apiClient.admin.photographers.$post({
      json: {
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
      },
    });
    const { errorMessage, payload } = await readApiResponse<{
      generatedPassword: string;
      id: string;
    }>(response);

    if (!response.ok || !payload) {
      toast.error(errorMessage ?? "Couldn't create the photographer.");
      return;
    }

    toast.success(
      `Photographer created. Temporary password: ${payload.generatedPassword}`,
      { duration: 15000 },
    );
    setIsOpen(false);
    form.reset();
    router.push(`/admin/photographer/${payload.id}`);
    router.refresh();
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button type="button" className="h-11 rounded-lg">
          <Plus className="size-4" />
          Add photographer
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a photographer</SheetTitle>
          <SheetDescription>
            Creates a photographer profile and a login account. You can fill in
            the rest of their profile afterwards.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4"
          noValidate
        >
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor={nameId}>Name</FieldLabel>
            <FieldContent>
              <Input
                id={nameId}
                placeholder="Aarav Patel"
                autoFocus
                aria-invalid={!!errors.name}
                disabled={isSubmitting}
                {...form.register("name")}
              />
            </FieldContent>
            <FieldErrorComponent errors={errors.name ? [errors.name] : []} />
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
            <FieldContent>
              <Input
                id={phoneId}
                placeholder="+91 98765 43210"
                aria-invalid={!!errors.phone}
                disabled={isSubmitting}
                {...form.register("phone")}
              />
            </FieldContent>
            <FieldErrorComponent errors={errors.phone ? [errors.phone] : []} />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor={emailId}>Email (optional)</FieldLabel>
            <FieldDescription>
              Used as the login email. If left blank, one is generated from the
              phone number.
            </FieldDescription>
            <FieldContent>
              <Input
                id={emailId}
                type="email"
                placeholder="hello@studio.com"
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
                {...form.register("email")}
              />
            </FieldContent>
            <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
          </Field>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create photographer"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
