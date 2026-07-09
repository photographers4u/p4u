import "server-only";

import { isAPIError } from "better-auth/api";
import { auth } from "@/server/auth";
import { photographerController } from "@/server/db/controller/photographer";
import { photographerContactController } from "@/server/db/controller/photographer-contact";
import { ConflictError } from "@/server/db/helpers/errors";
import { generateRandomPassword } from "@/zod/helpers";
import type {
  CreateAdminPhotographerInput,
  PhotographerOnboardingSpecialityInput,
  SyncAdminPhotographerSpecialitiesInput,
  UpdatePhotographerProfileInput,
} from "@/zod/schema/photographer";
import type { SavePhotographerContactInput } from "@/zod/schema/photographer-contact";

function buildAdminPhotographerEmailAlias(phone: string) {
  return `work.photographers4u+${phone}@gmail.com`;
}

export async function createAdminPhotographer(
  input: CreateAdminPhotographerInput,
) {
  await photographerController.assertPhotographerPhoneAvailable(input.phone);

  const email = input.email ?? buildAdminPhotographerEmailAlias(input.phone);
  const password = generateRandomPassword();
  let userId: string;

  try {
    const { user } = await auth.api.createUser({
      body: {
        email,
        password,
        name: input.name,
        // better-auth's admin plugin types `role` as "user" | "admin" unless a
        // custom access-control `roles` map is configured; our `role` column
        // is plain text and accepts "photographer" fine at runtime.
        role: "photographer" as "user",
        data: {
          emailVerified: true,
        },
      },
    });
    userId = user.id;
  } catch (error) {
    if (isAPIError(error)) {
      throw new ConflictError("A user with this email already exists");
    }

    throw error;
  }

  let entry: Awaited<
    ReturnType<typeof photographerController.createAdminPhotographerProfile>
  >;

  try {
    entry = await photographerController.createAdminPhotographerProfile(
      userId,
      email,
      input,
    );
  } catch (error) {
    console.error(
      "Created an auth user for a new photographer but failed to save the photographer profile",
      { error, userId },
    );
    throw error;
  }

  return { ...entry, generatedPassword: password };
}

export async function updateAdminPhotographerProfileById(
  id: string,
  input: UpdatePhotographerProfileInput,
) {
  return photographerController.updateAdminPhotographerProfile(id, input);
}

export async function updateAdminPhotographerAvatarById(
  id: string,
  avatar: string,
) {
  return photographerController.updateAdminPhotographerAvatar(id, avatar);
}

export async function syncAdminPhotographerSpecialitiesById(
  id: string,
  specialities: PhotographerOnboardingSpecialityInput[],
) {
  return photographerController.syncAdminPhotographerSpecialities(
    id,
    specialities,
  );
}

export async function updateAdminPhotographerContactById(
  id: string,
  input: SavePhotographerContactInput,
) {
  return photographerContactController.savePhotographerContactByPhotographerId(
    id,
    input,
  );
}

export type { SyncAdminPhotographerSpecialitiesInput };
