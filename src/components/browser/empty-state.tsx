import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="ring-0 shadow-none">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <Icon className="size-5 mb-4 text-muted-foreground" />
        <div className="space-y-1">
          <p className="font-medium text-base">{title}</p>
          <p className="text-sm mt-1 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
