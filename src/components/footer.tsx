import Link from "next/link";
import { siteConfig } from "@/config/site";

type FooterLink = { label: string; href: string };

const DIRECTORY: FooterLink[] = [
  { label: "Photographers", href: "/photographers" },
  { label: "Dashboard", href: "/dashboard/bookmarks" },
];

const COMPANY: FooterLink[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact", href: "/contact" },
  { label: "Join Us", href: "/join-us" },
];

const ECOSYSTEM: FooterLink[] = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy-policy" },
];

const SOCIALS = [
  {
    label: "LinkedIn",
    href: siteConfig.socials.linkedin,
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
        <title>LinkedIn</title>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: siteConfig.socials.twitter,
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
        <title>X / Twitter</title>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: siteConfig.socials.instagram,
    icon: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
        <title>Instagram</title>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

function NavColumn({
  heading,
  links,
}: {
  heading: string;
  links: FooterLink[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-[0.68rem] font-medium tracking-[0.1em] uppercase text-stone-600 dark:text-stone-600">
        {heading}
      </p>
      <ul className="space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="group relative text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200 inline-block"
            >
              {label}
              <span className="absolute -bottom-px left-0 w-0 h-px bg-stone-400 dark:bg-amber-200/50 transition-all duration-300 group-hover:w-full" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-stone-50 dark:bg-[#0e0e0e] border-t border-stone-200 dark:border-stone-800/50 overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 dark:via-blue-200/20 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-10 border bg-blue-50/50 aspect-square overflow-hidden text-white flex relative items-center justify-center rounded-md text-sm font-semibold">
                <img
                  src="/logo-192.png"
                  alt={siteConfig.name} 
                  className="h-8! w-8! aspect-square absolute"
                />
              </div>
              <span className="text-base font-semibold tracking-tight">
                {siteConfig.shortName}
              </span>
            </Link>

            <p className="text-sm text-stone-500 dark:text-stone-500 leading-relaxed max-w-xs">
              {siteConfig.description}
            </p>

            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 dark:text-stone-600 bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-stone-800/50 hover:text-stone-800 dark:hover:text-amber-200/80 hover:border-stone-300 dark:hover:border-amber-200/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-10">
            <NavColumn heading="Explore" links={DIRECTORY} />
            <NavColumn heading="Company" links={COMPANY} />
            <NavColumn heading="Ecosystem" links={ECOSYSTEM} />

            <div className="space-y-5">
              <p className="text-[0.68rem] font-medium tracking-[0.1em] uppercase text-stone-600 dark:text-stone-600">
                Contact
              </p>
              <div className="space-y-3 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                <p>
                  {siteConfig.contact.address.city}
                  <br />
                  {siteConfig.contact.address.pin},{" "}
                  {siteConfig.contact.address.country}
                </p>
                <Link
                  href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                  className="block hover:text-stone-900 dark:hover:text-amber-200/80 transition-colors duration-200"
                >
                  {siteConfig.contact.phone}
                </Link>
                <Link
                  href={`mailto:${siteConfig.contact.email}`}
                  className="block hover:text-stone-900 dark:hover:text-amber-200/80 transition-colors duration-200"
                >
                  {siteConfig.contact.email}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-7xl px-6 mx-auto py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <p className="text-xs text-stone-400 dark:text-stone-600">
              &copy; {new Date().getFullYear()} {siteConfig.name}.
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-600">
              <Link
                href="/terms"
                className="transition-colors duration-200 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="transition-colors duration-200 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Privacy
              </Link>
            </div>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-600">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
