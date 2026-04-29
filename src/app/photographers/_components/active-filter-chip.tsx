import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button type="button" onClick={onRemove}>
      <Badge
        variant="outline"
        className="h-7 cursor-pointer gap-1 rounded-md border-slate-300 bg-slate-50 px-2.5 text-xs text-slate-700 transition hover:border-slate-400 hover:bg-white"
      >
        <span>{label}</span>
        <X className="size-3" />
      </Badge>
    </button>
  );
}
