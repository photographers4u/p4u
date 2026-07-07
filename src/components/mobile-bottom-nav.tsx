import { headers } from "next/headers";
import type { AuthClientSession } from "@/lib/auth-client";
import { getOwnPhotographerProfileLink } from "@/lib/photographer-own-profile";
import { getCurrentPhotographer } from "@/server/services/photographer";
import { MobileBottomNavClient } from "./mobile-bottom-nav-client";

async function MobileBottomNav({
  session,
}: {
  session: AuthClientSession | null;
}) {
  const photographer = session?.user
    ? await getCurrentPhotographer(await headers())
    : null;
  const profileLink = getOwnPhotographerProfileLink(photographer);

  const profile = profileLink
    ? {
        label: "Profile",
        href: profileLink.href,
        matchPath: profileLink.matchPath,
        avatarUrl: profileLink.avatarUrl,
      }
    : null;

  return <MobileBottomNavClient session={session} profile={profile} />;
}

export { MobileBottomNav };
export default MobileBottomNav;
