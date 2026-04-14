import { redirect } from "next/navigation";
import {
  getServerPhotographer,
  getServerPhotographerOnboarding,
} from "@/lib/server-api";

export async function getApprovedPhotographerPanelData(
  requestHeaders: Headers,
) {
  const [photographer, onboarding] = await Promise.all([
    getServerPhotographer(requestHeaders),
    getServerPhotographerOnboarding(requestHeaders),
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

export async function getPhotographerPortfolioPageData(
  requestHeaders: Headers,
) {
  const [photographer, onboarding] = await Promise.all([
    getServerPhotographer(requestHeaders),
    getServerPhotographerOnboarding(requestHeaders),
  ]);

  if (!onboarding) {
    redirect("/login");
  }

  return {
    onboarding,
    photographer,
  };
}
