import { Eye, EyeOff, Fan, MailIcon } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const AuthContainer = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="space-y-10">
    <div className="flex flex-col items-center gap-2 text-center mb-8">
      <Fan className="size-5 animate-spin" />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </div>
);

export type ModeToggleProps = {
  mode: "magic" | "email-password";
  onChange: (mode: "magic" | "email-password") => void;
};

export const AuthModeToggle = ({ mode, onChange }: ModeToggleProps) => (
  <>
    {mode === "magic" ? (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onChange("email-password")}
      >
        Use password instead
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => onChange("magic")}
      >
        <MailIcon data-icon="inline-start" />
        Use a sign-in link instead
      </Button>
    )}
  </>
);

type PasswordFieldProps = {
  label?: string;
  placeholder?: string;
  description?: string;
  error?: FieldError | undefined;
  registration: UseFormRegisterReturn;
  showForgotPassword?: boolean;
  disabled?: boolean;
};

export function PasswordField({
  label = "Password",
  placeholder = "Enter your password",
  description = "Keep it private.",
  error,
  registration,
  disabled = false,
  showForgotPassword = false,
}: PasswordFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <Field data-invalid={!!error}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {showForgotPassword && (
          <Link
            href="/reset-password"
            className="text-[13px] text-primary hover:underline"
          >
            Forgot password?
          </Link>
        )}
      </div>

      <FieldContent>
        <div className="relative">
          <Input
            id={id}
            type={show ? "text" : "password"}
            placeholder={placeholder}
            autoComplete="current-password"
            aria-invalid={!!error}
            disabled={disabled}
            {...registration}
            className="pr-10"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            tabIndex={-1}
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FieldContent>

      {!error && <FieldDescription>{description}</FieldDescription>}

      <FieldErrorComponent errors={error ? [error] : []} />
    </Field>
  );
}
