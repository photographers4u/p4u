import { headers } from "next/headers";
import Link from "next/link";
import BrowsePhotographers from "@/components/browse-photographers";
import CircularGallery from "@/components/circular-gallery";
import FAQSection from "@/components/faq-section";
import FeaturedPhotographersCarousel from "@/components/featured-photographers";
import { Footer } from "@/components/footer";
import { MobileAppHome } from "@/components/mobile-app-home";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileHero } from "@/components/mobile-hero";
import Navbar from "@/components/navbar";
import SectionContainer from "@/components/section-ui";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { photographers } from "@/data/feature-photographers";
import { playfairDisplay } from "@/lib/fonts";
import { DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS } from "@/lib/public-photographer-explore";
import { cn } from "@/lib/utils";
import { getAuthSession } from "@/server/auth/session";
import {
  getPublicFeaturedPhotographers,
  getPublicPhotographerExplorePage,
} from "@/server/services/photographer";

const images = [
  "/hero-images/10002.jpeg",
  "/hero-images/10039.jpg",
  "/hero-images/10005.jpeg",
  "/hero-images/10007.jpeg",
  "/hero-images/10008.jpeg",
  "/hero-images/10009.jpeg",
  "/hero-images/10012.jpeg",
  "/hero-images/10013.jpeg",
  "/hero-images/10016.jpeg",
  "/hero-images/10018.jpeg",
  "/hero-images/10024.jpg",
  "/hero-images/10025.jpg",
  "/hero-images/10036.jpg",
];

export default async function HomePage() {
  const requestHeaders = await headers();
  const [session, featuredPhotographers, browsePhotographersPage] =
    await Promise.all([
      getAuthSession({ headers: requestHeaders }),
      getPublicFeaturedPhotographers(),
      getPublicPhotographerExplorePage(
        DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
        { page: 1, pageSize: 6 },
      ),
    ]);

  return (
    <>
      <Navbar session={session} />
      <MobileBottomNav session={session} />
      <main className="min-h-screen relative text-slate-900 max-md:bg-neutral-50">
        <MobileHero images={[images[4] ?? images[0], images[1], images[2]]} />
        <MobileAppHome />

        <div className="hidden min-h-screen w-full absolute sm:flex items-center justify-center">
          <CircularGallery
            radius={580}
            duration={100}
            imageScale={1.75}
            items={images}
          />
          <div className="h-24 absolute bottom-0 w-full bg-linear-to-t from-white via-white/75 to-transparent" />
          <section className="absolute bottom-0 isolate overflow-hidden pb-36 drop-shadow-2xl drop-shadow-white">
            <div className="relative mx-auto flex  w-full max-w-4xl text-center flex-col justify-center px-6 sm:px-8 lg:px-10">
              <h1
                className={`mt-6 text-5xl font-semibold text-balance leading-tight text-slate-950 sm:text-6xl lg:text-7xl $`}
                style={playfairDisplay.style}
              >
                Capture the Perfect Moment
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
                Capture the India's premier photographers. From intimate
                portraits to grand weddings, find the artist who sees your
                vision.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  className="rounded-md text-lg tracking-[0.5px] font-normal px-8 py-2 h-fit"
                >
                  <Link href="/photographers">Explore</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-md text-lg font-normal px-8 py-2 h-fit bg-neutral-50"
                  variant="outline"
                >
                  <Link href="/register">Join Us</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
        <SectionContainer
          className="sm:mt-[110vh]"
          title="Featured Photographers"
          subtitle="A selection of photographers we currently recommend."
        >
          <FeaturedPhotographersCarousel
            photographers={featuredPhotographers}
          />
        </SectionContainer>

        <SectionContainer
          title="Browse Photographers"
          subtitle="Discover talented photographers ready to capture your moments."
        >
          <BrowsePhotographers
            photographers={browsePhotographersPage.photographers}
          />
        </SectionContainer>

        <FAQSection />

        <div
          className={cn(
            "mx-auto md:px-10 lg:px-20 relative overflow-hidden border md:rounded-3xl bg-[#FBFBFB] max-md:mx-4 max-md:rounded-3xl max-md:bg-white max-md:shadow-sm px-0! max-w-7xl",
          )}
        >
          <div className="flex flex-col gap-6 px-6 pt-8 sm:px-10 sm:pt-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:pt-14">
            <div
              className="text-2xl sm:text-3xl lg:text-5xl font-bold"
              style={playfairDisplay.style}
            >
              <p>Are you a photographer?</p>
              <p className="mt-2">Be a part of photographers4u.</p>
            </div>

            <Button
              size="lg"
              className="w-fit rounded-full h-fit text-[15px] sm:text-base px-6 sm:px-8 py-3"
              asChild
            >
              <Link href="/register">Join Community</Link>
            </Button>
          </div>

          <div className="relative mt-10 sm:mt-14 h-[260px] sm:h-80 lg:h-[480px] flex items-center">
            <img
              src="/camera-face-bottom-left.png"
              alt="Camera"
              className="
          absolute bottom-0 right-0
          h-[70%] sm:h-[85%] lg:h-full
          pointer-events-none select-none
        "
            />

            <div className="relative z-10 w-full">
              <Marquee>
                {photographers.map((elem) => (
                  <div
                    key={elem.id}
                    className="bg-black rounded-full overflow-hidden text-white flex items-center gap-x-3 p-1.5 pr-8 sm:pr-12 mx-2"
                  >
                    <img
                      className="size-10 sm:size-12 rounded-full"
                      alt={`${elem.name} profile`}
                      src={elem.avatar}
                    />
                    <div>
                      <p className="text-xs sm:text-sm">{elem.name}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-400">
                        Photographer
                      </p>
                    </div>
                  </div>
                ))}
              </Marquee>

              <Marquee reverse className="mt-2">
                {photographers.map((elem) => (
                  <div
                    key={elem.id}
                    className="bg-black rounded-full overflow-hidden text-white flex items-center gap-x-3 p-1.5 pr-6 sm:pr-10 mx-2"
                  >
                    <img
                      className="size-10 sm:size-12 rounded-full"
                      alt={`${elem.name} profile`}
                      src={elem.avatar}
                    />
                    <div>
                      <p className="text-xs sm:text-sm">{elem.name}</p>
                      <p className="text-[10px] sm:text-xs text-neutral-400">
                        Photographer
                      </p>
                    </div>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        </div>
      </main>
      <div className="pt-16 pb-16 max-md:pb-32" />
      <Footer />
    </>
  );
}
