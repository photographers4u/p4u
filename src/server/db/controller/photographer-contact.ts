import { isApprovedPhotographer } from "@/lib/photographer-status";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { photographerDal } from "@/server/db/dal/photographer";
import {
  type PhotographerContactRecord,
  photographerContactDal,
} from "@/server/db/dal/photographer-contact";
import {
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
} from "@/server/db/helpers/errors";
import type {
  PhotographerContact,
  SavePhotographerContactInput,
} from "@/zod/schema";

type DBClient = DBExecutor | DBTransaction;

function normalizePhotographerContactEmail(email: string) {
  return email.trim().toLowerCase();
}

function toPhotographerContact(
  contact: PhotographerContactRecord | null,
): PhotographerContact | null {
  if (!contact) {
    return null;
  }

  return {
    id: contact.id,
    photographerId: contact.photographerId,
    phone: contact.phone,
    email: contact.email,
    emailVerified: contact.emailVerified,
    isPublic: contact.isPublic,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}

async function getPhotographerByUserIdOrThrow(
  userId: string,
  executor: DBClient = db,
) {
  const photographer = await photographerDal.getByUserId(userId, executor);

  if (!photographer) {
    throw new NotFoundError("Photographer not found");
  }

  return photographer;
}

async function savePhotographerContactByPhotographerId(
  photographerId: string,
  input: SavePhotographerContactInput,
  executor: DBClient = db,
) {
  const normalizedEmail = normalizePhotographerContactEmail(input.email);
  const existingContact = await photographerContactDal.getByPhotographerId(
    photographerId,
    executor,
  );
  const conflictingContact = await photographerContactDal.getByEmail(
    normalizedEmail,
    executor,
  );

  if (
    conflictingContact &&
    conflictingContact.photographerId !== photographerId
  ) {
    throw new ConflictError(
      "That email address is already being used by another photographer contact",
    );
  }

  if (!existingContact) {
    const contact = await photographerContactDal.create(
      {
        photographerId,
        phone: input.phone,
        email: normalizedEmail,
        emailVerified: false,
        isPublic: input.isPublic,
      },
      executor,
    );

    if (!contact) {
      throw new InternalError("Failed to create photographer contact");
    }

    return contact;
  }

  const nextEmailVerified =
    normalizePhotographerContactEmail(existingContact.email) === normalizedEmail
      ? existingContact.emailVerified
      : false;
  const contact = await photographerContactDal.updateById(
    existingContact.id,
    {
      phone: input.phone,
      email: normalizedEmail,
      emailVerified: nextEmailVerified,
      isPublic: input.isPublic,
    },
    executor,
  );

  if (!contact) {
    throw new InternalError("Failed to update photographer contact");
  }

  return contact;
}

export const photographerContactController = {
  async getPhotographerContactByPhotographerId(
    photographerId: string,
    executor: DBClient = db,
  ) {
    const contact = await photographerContactDal.getByPhotographerId(
      photographerId,
      executor,
    );

    return toPhotographerContact(contact);
  },

  async getPhotographerContactByUserId(userId: string) {
    const photographer = await getPhotographerByUserIdOrThrow(userId);

    return toPhotographerContact(
      await photographerContactDal.getByPhotographerId(photographer.id),
    );
  },

  async savePhotographerContactByPhotographerId(
    photographerId: string,
    input: SavePhotographerContactInput,
    executor: DBClient = db,
  ) {
    const contact = await savePhotographerContactByPhotographerId(
      photographerId,
      input,
      executor,
    );

    return toPhotographerContact(contact);
  },

  async savePhotographerContactByUserId(
    userId: string,
    input: SavePhotographerContactInput,
  ) {
    return db.transaction(async (tx) => {
      const photographer = await getPhotographerByUserIdOrThrow(userId, tx);

      if (!isApprovedPhotographer(photographer)) {
        throw new ForbiddenError(
          "Contact updates are only available on approved photographer profiles.",
        );
      }

      const contact = await savePhotographerContactByPhotographerId(
        photographer.id,
        input,
        tx,
      );

      return toPhotographerContact(contact);
    });
  },
};
