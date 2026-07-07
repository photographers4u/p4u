import { ChevronRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type React from "react";
import { playfairDisplay } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const SectionContainer = ({
  children,
  title,
  subtitle,
  className,
  viewAllHref,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
  viewAllHref?: Route;
}) => {
  return (
    <section className={cn("max-md:px-4 max-md:py-6 sm:py-28", className)}>
      <div className="max-w-7xl mx-auto text-center max-md:text-left">
        <div className="hidden items-center justify-between gap-3 max-md:flex">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-primary"
            >
              See all
              <ChevronRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        <h2
          className="text-4xl font-bold max-md:hidden"
          style={playfairDisplay.style}
        >
          {title}
        </h2>
        <p className="text-[19px] mt-4 max-md:hidden">{subtitle}</p>
      </div>
      <div className="mt-16 max-md:mt-4">{children}</div>
    </section>
  );
};

export default SectionContainer;
