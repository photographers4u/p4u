import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPhotographerStatusViewModel } from "@/lib/photographer-presentation";
import { getCurrentPhotographer } from "@/server/services/photographer";

export default async function DashboardIndexPage() {
  const photographer = await getCurrentPhotographer(await headers());

  if (photographer) {
    const status = getPhotographerStatusViewModel(photographer);

    redirect(
      status.shouldRedirectOnboardingToPortfolio
        ? "/dashboard/overview"
        : "/onboarding",
    );
  }

  redirect("/dashboard/bookmarks");
}
