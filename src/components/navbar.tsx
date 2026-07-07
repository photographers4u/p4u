import { headers } from "next/headers";
import { NavbarClient } from "@/components/navbar-client";
import type { AuthClientSession } from "@/lib/auth-client";
import { getOwnPhotographerProfileLink } from "@/lib/photographer-own-profile";
import { getCurrentPhotographer } from "@/server/services/photographer";

async function Navbar({ session }: { session: AuthClientSession | null }) {
  const photographer = session?.user
    ? await getCurrentPhotographer(await headers())
    : null;
  const profile = getOwnPhotographerProfileLink(photographer);

  return <NavbarClient session={session} profile={profile} />;
}

export { Navbar };
export default Navbar;
