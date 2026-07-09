"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ADMIN_PANEL_ROLES, type AdminPanelRole } from "@/lib/admin-role";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { createAdminStaffSchema } from "@/zod/schema/admin-staff";

type CreateStaffFormValues = {
  name: string;
  email: string;
  role: AdminPanelRole;
};

const roleLabels: Record<AdminPanelRole, string> = {
  admin: "Admin",
  sales: "Sales",
};

export function AdminCreateStaffDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const roleId = useId();

  const form = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createAdminStaffSchema),
    defaultValues: { name: "", email: "", role: "sales" },
    mode: "onSubmit",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;
  const role = form.watch("role");

  async function onSubmit(values: CreateStaffFormValues) {
    const response = await apiClient.admin.staff.$post({
      json: values,
    });
    const { errorMessage, payload } = await readApiResponse<{
      generatedPassword: string;
      id: string;
    }>(response);

    if (!response.ok || !payload) {
      toast.error(errorMessage ?? "Couldn't create the staff account.");
      return;
    }

    toast.success(
      `Staff account created. Temporary password: ${payload.generatedPassword}`,
      { duration: 15000 },
    );
    setIsOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button type="button" className="h-11 rounded-lg">
          <Plus className="size-4" />
          Add staff
        </Button>
      </SheetTrigger>

      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a staff account</SheetTitle>
          <SheetDescription>
            Creates an admin console login. Admin and sales accounts currently
            have identical access.
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

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor={emailId}>Email</FieldLabel>
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

          <Field data-invalid={!!errors.role}>
            <FieldLabel htmlFor={roleId}>Role</FieldLabel>
            <FieldContent>
              <Select
                value={role}
                onValueChange={(value) => {
                  form.setValue("role", value as AdminPanelRole, {
                    shouldDirty: true,
                  });
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id={roleId} className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_PANEL_ROLES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {roleLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            <FieldErrorComponent errors={errors.role ? [errors.role] : []} />
          </Field>

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create staff account"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
