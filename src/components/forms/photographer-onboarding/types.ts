import type { Path } from "react-hook-form";
import type { CITIES, EXPERIENCE_YEARS, ONBOARDING_STEPS } from "@/zod/helpers";
import type {
  PhotographerOnboardingState,
  PhotographerOnboardingUploadInput,
} from "@/zod/schema/photographer";

export type StepNumber = (typeof ONBOARDING_STEPS)[number];

export type OnboardingFormValues = {
  avatar: string;
  bio: string;
  contact: {
    email: string;
    isPublic: boolean;
    phone: string;
  };
  experienceYears: "" | (typeof EXPERIENCE_YEARS)[number];
  locationCity: "" | (typeof CITIES)[number];
  name: string;
  selectedSpecialityIds: string[];
  specialities: Array<{
    specialityId: string;
    startingPrice: string;
  }>;
  uploads: PhotographerOnboardingUploadInput[];
};

export type AvailableSpecialityOption = {
  id: string;
  name: string;
};

export const stepFieldPaths: Record<StepNumber, Path<OnboardingFormValues>[]> =
  {
    1: ["name", "bio", "locationCity", "experienceYears"],
    2: ["avatar"],
    3: ["selectedSpecialityIds", "specialities"],
    4: ["uploads"],
    5: ["contact.phone", "contact.email", "contact.isPublic"],
  };

function toSpecialityFormValues(
  initialSpecialities: PhotographerOnboardingState["specialities"],
  availableSpecialities: AvailableSpecialityOption[],
) {
  const savedPricesBySpecialityId = new Map(
    initialSpecialities.map((speciality) => [
      speciality.specialityId,
      String(speciality.startingPrice),
    ]),
  );

  if (availableSpecialities.length === 0) {
    return initialSpecialities.map((speciality) => ({
      specialityId: speciality.specialityId,
      startingPrice: String(speciality.startingPrice),
    }));
  }

  return availableSpecialities.map((speciality) => ({
    specialityId: speciality.id,
    startingPrice: savedPricesBySpecialityId.get(speciality.id) ?? "",
  }));
}

function toSelectedSpecialityIds(
  initialSpecialities: PhotographerOnboardingState["specialities"],
  availableSpecialities: AvailableSpecialityOption[],
) {
  if (availableSpecialities.length === 0) {
    return initialSpecialities.map((speciality) => speciality.specialityId);
  }

  const availableSpecialityIds = new Set(
    availableSpecialities.map((speciality) => speciality.id),
  );

  return initialSpecialities
    .map((speciality) => speciality.specialityId)
    .filter((specialityId) => availableSpecialityIds.has(specialityId));
}

export function toFormValues(
  initialData: PhotographerOnboardingState,
  defaultEmail: string,
  availableSpecialities: AvailableSpecialityOption[],
): OnboardingFormValues {
  return {
    avatar: initialData.avatar ?? "",
    bio: initialData.bio ?? "",
    contact: {
      email: initialData.contact?.email ?? defaultEmail,
      isPublic: initialData.contact?.isPublic ?? false,
      phone: initialData.contact?.phone ?? "",
    },
    experienceYears: initialData.experienceYears ?? "",
    locationCity: initialData.locationCity ?? "",
    name: initialData.name ?? "",
    selectedSpecialityIds: toSelectedSpecialityIds(
      initialData.specialities,
      availableSpecialities,
    ),
    specialities: toSpecialityFormValues(
      initialData.specialities,
      availableSpecialities,
    ),
    uploads: initialData.uploads,
  };
}
