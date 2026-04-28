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
    <section className={cn("py-28", className)}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold" style={playfairDisplay.style}>{title}</h2>
        <p className="text-[19px] mt-4">{subtitle}</p>
      </div>
      <div className="mt-16">{children}</div>
    </section>
  );
};

export default SectionContainer;
