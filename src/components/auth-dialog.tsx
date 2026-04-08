import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoginForm } from "./forms/login";
import { AuthClientSession } from "@/lib/auth-client";
import { X } from "lucide-react";

export function AuthDialog({
  button,
  session,
  children,
  callbackUrl = "/account",
}: {
  button: React.ReactNode;
  session: AuthClientSession | null;
  children: React.ReactNode;
  callbackUrl?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent className="p-8" size="lg">
        <AlertDialogCancel
          variant="secondary"
          size="icon-sm"
          className="absolute top-4 right-4"
        >
          <X />
        </AlertDialogCancel>
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle></AlertDialogTitle>
        </AlertDialogHeader>
        {session?.user ? children : <LoginForm callbackUrl={callbackUrl} />}
      </AlertDialogContent>
    </AlertDialog>
  );
}
