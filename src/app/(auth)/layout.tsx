import type React from "react";
import { inter } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md" style={inter.style}>
        <Button variant="link" asChild className="absolute top-2 left-0">
          <Link href="/">
            <ChevronLeft /> Home
          </Link>
        </Button>
        {children}
      </div>
    </div>
  );
};

export default layout;
