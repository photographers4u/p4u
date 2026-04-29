import type { Dispatch, SetStateAction } from "react";
import type { PublicPhotographerExploreFilters } from "@/lib/public-photographer-explore";

export type PhotographersBrowserDialogFilters = Pick<
  PublicPhotographerExploreFilters,
  "experience" | "location" | "specialities"
>;

export type SetPhotographersBrowserDialogFilters = Dispatch<
  SetStateAction<PhotographersBrowserDialogFilters>
>;
