import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function BrowserFilterSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

export function BrowserFilterButtonGroup<TOption extends string>({
  options,
  value,
  onChange,
  getLabel,
  containerClassName,
  buttonClassName,
  stretch = false,
}: {
  options: readonly TOption[];
  value: TOption;
  onChange: (value: TOption) => void;
  getLabel: (value: TOption) => ReactNode;
  containerClassName?: string;
  buttonClassName?: string;
  stretch?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", containerClassName)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            buttonVariants({
              variant: option === value ? "outline" : "ghost",
              size: "sm",
            }),
            stretch && "flex-1",
            buttonClassName,
          )}
        >
          {getLabel(option)}
        </button>
      ))}
    </div>
  );
}

export function BrowserFilterSelectField<TOption extends string>({
  label,
  value,
  options,
  onChange,
  getLabel,
  triggerClassName,
}: {
  label: string;
  value: TOption;
  options: readonly TOption[];
  onChange: (value: TOption) => void;
  getLabel: (value: TOption) => ReactNode;
  triggerClassName?: string;
}) {
  return (
    <BrowserFilterSection label={label}>
      <Select
        value={value}
        onValueChange={(next: string) => onChange(next as TOption)}
      >
        <SelectTrigger
          size="sm"
          className={cn("h-8 w-full text-xs", triggerClassName)}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {getLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </BrowserFilterSection>
  );
}
