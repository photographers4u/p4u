import { playfairDisplay } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import React from "react";

const SectionContainer = ({
  children,
  title,
  subtitle,
  className,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) => {
  return (
    <section
      className={cn(
        "max-md:mx-4 max-md:rounded-3xl max-md:border max-md:border-zinc-200/70 max-md:bg-white max-md:px-4 max-md:py-6 max-md:shadow-sm sm:py-28",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto text-center max-md:text-left">
        <h2
          className="text-4xl font-bold max-md:text-lg"
          style={playfairDisplay.style}
        >
          {title}
        </h2>
        <p className="text-[19px] mt-4 max-md:mt-1 max-md:text-sm max-md:text-zinc-500">
          {subtitle}
        </p>
      </div>
      <div className="mt-16 max-md:mt-4">{children}</div>
    </section>
  );
};

export default SectionContainer;
