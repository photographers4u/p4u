import { z } from "zod";
import { ADMIN_PANEL_ROLES } from "@/lib/admin-role";
import { requiredTextSchema } from "@/zod/helpers";

export const adminStaffRoleSchema = z.enum(ADMIN_PANEL_ROLES);

export const createAdminStaffSchema = z.object({
  name: requiredTextSchema("Name"),
  email: z.string().trim().email("Enter a valid email address"),
  role: adminStaffRoleSchema,
});

export type CreateAdminStaffInput = z.infer<typeof createAdminStaffSchema>;
