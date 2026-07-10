import "server-only";

import { unstable_cache } from "next/cache";
import { API_CACHE_NAMESPACES } from "@/server/api/lib/response-cache";
import {
  type SpecialityRecord,
  specialityDal,
} from "@/server/db/dal/speciality";
import { type Speciality, specialitySchema } from "@/zod/schema";

export type SpecialityFormOption = Pick<Speciality, "id" | "name">;
export type SpecialityFilterOption = Pick<Speciality, "name" | "slug">;

const SPECIALITIES_CACHE_TTL_SECONDS = 300;

function toSpeciality(record: SpecialityRecord): Speciality {
  return specialitySchema.parse({
    ...record,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  });
}

const getCachedSpecialities = unstable_cache(
  async () => (await specialityDal.getAll()).map(toSpeciality),
  ["specialities-list"],
  {
    revalidate: SPECIALITIES_CACHE_TTL_SECONDS,
    tags: [API_CACHE_NAMESPACES.specialities],
  },
);

export async function getSpecialities(): Promise<Speciality[]> {
  return getCachedSpecialities();
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
