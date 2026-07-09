import "server-only";

import { isAPIError } from "better-auth/api";
import { auth } from "@/server/auth";
import { userDal } from "@/server/db/dal/user";
import { ConflictError } from "@/server/db/helpers/errors";
import { generateRandomPassword } from "@/zod/helpers";
import type { CreateAdminStaffInput } from "@/zod/schema/admin-staff";

export async function createAdminStaff(input: CreateAdminStaffInput) {
  const password = generateRandomPassword();

  try {
    // better-auth's admin plugin types `role` as "user" | "admin" unless a
    // custom access-control `roles` map is configured; our `role` column is
    // plain text and accepts "sales" fine at runtime.
    const { user } = await auth.api.createUser({
      body: {
        email: input.email,
        password,
        name: input.name,
        role: input.role as "admin",
        data: {
          emailVerified: true,
        },
      },
    });

    return {
      id: user.id,
      name: input.name,
      email: input.email,
      role: input.role,
      generatedPassword: password,
    };
  } catch (error) {
    if (isAPIError(error)) {
      throw new ConflictError("A user with this email already exists");
    }

    throw error;
  }
}

export async function listAdminStaff() {
  return userDal.listStaffUsers();
}
