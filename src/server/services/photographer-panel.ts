import "server-only";

import { redirect } from "next/navigation";
import {
  getCurrentPhotographer,
  getCurrentPhotographerOnboarding,
} from "@/server/services/photographer";

export async function getApprovedPhotographerPanelData(headers: Headers) {
  const [photographer, onboarding] = await Promise.all([
    getCurrentPhotographer(headers),
    getCurrentPhotographerOnboarding(headers),
  ]);

  if (!photographer) {
    redirect("/onboarding");
  }

  if (photographer.status !== "approved" && !photographer.isPublished) {
    redirect("/onboarding");
  }

  if (!onboarding) {
    redirect("/onboarding");
  }

  return {
    onboarding,
    photographer,
  };
}
