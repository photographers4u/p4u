import { headers } from "next/headers";
import Link from "next/link";
import CircularGallery from "@/components/circular-gallery";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import FeaturedPhotographersCarousel from "@/components/featured-photographers";
import { playfairDisplay } from "@/lib/fonts";
import { DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS } from "@/lib/public-photographer-explore";
import SectionContainer from "@/components/section-ui";
import { cn } from "@/lib/utils";
import { getAuthSession } from "@/server/auth/session";
import { getPublicPhotographerExplorePage } from "@/server/services/photographer";
import { Marquee } from "@/components/ui/marquee";
import { photographers } from "@/data/feature-photographers";

const images = [
  "https://i.pinimg.com/736x/c7/2a/ff/c72affc2be6258e2fd0c98484c6ee6ab.jpg",
  "https://i.pinimg.com/736x/98/dd/7b/98dd7ba105bc1bbd561fa30e4775bef9.jpg",
  "https://i.pinimg.com/736x/26/a2/79/26a279d03312e7600fe895e06ed2b83f.jpg",
  "https://i.pinimg.com/1200x/dc/a4/c3/dca4c3b887336b3015ec25d8405f4c9f.jpg",
  "https://i.pinimg.com/736x/b5/90/1a/b5901aa520415057fb918d5329ce4a57.jpg",
  "https://i.pinimg.com/736x/22/bc/0b/22bc0b13d0d782fca9f7b95bfef7d320.jpg",
  "https://i.pinimg.com/736x/2f/2b/71/2f2b71ceda2f440beda6c8f3560feb28.jpg",
  "https://i.pinimg.com/1200x/9c/6a/e6/9c6ae6b5178a136217a3debadf71cb65.jpg",
  "https://i.pinimg.com/1200x/d4/31/cc/d431cc8d405b07f7571c23ce2fd6caaf.jpg",
  "https://i.pinimg.com/1200x/39/64/74/39647441becc0bb961ddc7c332eacfea.jpg",
  "https://i.pinimg.com/736x/61/0b/65/610b65f596002ecf37a961c554214f33.jpg",
  "https://i.pinimg.com/1200x/8f/1e/6c/8f1e6c733e46f76c5a032abb87a42190.jpg",
  "https://i.pinimg.com/736x/ba/fd/39/bafd39fcd675b653969bd4a805d4a366.jpg",
];

export default async function HomePage() {
  const requestHeaders = await headers();
  const [session, featuredPhotographers] = await Promise.all([
    getAuthSession({ headers: requestHeaders }),
    getPublicPhotographerExplorePage(
      DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
      {
        page: 1,
        pageSize: 8,
      },
    ),
  ]);

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen relative text-slate-900">
        <div className="min-h-screen w-full absolute flex items-center justify-center">
          <CircularGallery
            radius={580}
            duration={100}
            imageScale={1.75}
            items={images}
          />
          <div className="h-24 absolute bottom-0 w-full bg-linear-to-t from-white via-white/75 to-transparent" />
          <section className="absolute bottom-0 isolate overflow-hidden pb-28">
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
                  className="rounded-full text-lg tracking-[0.5px] font-normal px-8 py-2 h-fit"
                >
                  <Link href="/photographers">Explore</Link>
                </Button>
                <Button
                  asChild
                  className="rounded-full text-lg font-normal px-8 py-2 h-fit bg-neutral-50"
                  variant="outline"
                >
                  <Link href="/register">Join Us</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
        <SectionContainer
          className="mt-[110vh]"
          title="Featured Photographers"
          subtitle="A selection of photographers we currently recommend."
        >
          <FeaturedPhotographersCarousel
            photographers={featuredPhotographers.photographers}
          />
        </SectionContainer>

        <div
          className={cn(
            "mx-auto md:px-10 lg:px-20 relative overflow-hidden border md:rounded-3xl bg-[#FBFBFB] px-0! max-w-7xl",
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
      <Footer />
    </>
  );
}
