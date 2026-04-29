import "server-only";

import {
  type SpecialityRecord,
  specialityDal,
} from "@/server/db/dal/speciality";
import { type Speciality, specialitySchema } from "@/zod/schema";

export type SpecialityFormOption = Pick<Speciality, "id" | "name">;
export type SpecialityFilterOption = Pick<Speciality, "name" | "slug">;

function toSpeciality(record: SpecialityRecord): Speciality {
  return specialitySchema.parse({
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
}

export async function getSpecialities(): Promise<Speciality[]> {
  return (await specialityDal.getAll()).map(toSpeciality);
}

export async function getSpecialityFormOptions(): Promise<
  SpecialityFormOption[]
> {
  return (await getSpecialities()).map(({ id, name }) => ({
    id,
    name,
  }));
}

export async function getSpecialityFilterOptions(): Promise<
  SpecialityFilterOption[]
> {
  return (await getSpecialities()).map(({ name, slug }) => ({
    name,
    slug,
  }));
}
