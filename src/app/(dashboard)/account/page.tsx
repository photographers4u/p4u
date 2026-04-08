import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PageHeader from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getServerAccount } from "@/lib/server-api";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AccountNotice = {
  message: string;
  tone: "error" | "info" | "success";
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getEmailChangeErrorMessage(code: string | undefined) {
  switch (code) {
    case "email-in-use":
      return "That new email address is already being used by another account.";
    case "invalid-link":
      return "This email-change link is invalid or has expired.";
    case "invalid-session":
      return "Open this link while signed into the same account that requested the change.";
    case "stale-request":
      return "This approval link is no longer current. Request the email change again.";
    default:
      return null;
  }
}

function getAccountNotice(
  params: Record<string, string | string[] | undefined>,
): AccountNotice | null {
  const emailChangeError = getEmailChangeErrorMessage(
    getFirstValue(params.emailChangeError),
  );

  if (emailChangeError) {
    return {
      message: emailChangeError,
      tone: "error",
    };
  }

  if (getFirstValue(params.emailChanged) === "1") {
    return {
      message:
        getFirstValue(params.verificationEmailSent) === "1"
          ? "Your email was changed and we sent a verification link to the new address."
          : "Your email was changed, but we couldn't send the verification email automatically.",
      tone:
        getFirstValue(params.verificationEmailSent) === "1"
          ? "success"
          : "info",
    };
  }

  return null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const account = await getServerAccount(requestHeaders);

  if (!account?.user) {
    redirect("/login");
  }

  const notice = getAccountNotice(params);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account"
        subtitle="Review the account details currently attached to this starter app."
      />

      {notice ? (
        <div className="rounded-3xl border px-4 py-3 text-sm">
          <p>{notice.message}</p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Profile summary</CardTitle>
            <CardDescription>
              This page is now a lightweight overview instead of the removed
              profile editor.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="mt-1 text-base font-medium">
                {account.user.name || "No name set"}
              </p>
            </div>
            <div className="rounded-3xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 text-base font-medium">{account.user.email}</p>
            </div>
            <div className="rounded-3xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="mt-1 text-base font-medium capitalize">
                {account.user.role || "user"}
              </p>
            </div>
            <div className="rounded-3xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Pending email</p>
              <p className="mt-1 text-base font-medium">
                {account.pendingEmail || "No pending email change"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              Use the security page for password changes, or sign out directly
              from here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              You are currently signed in and can access the cleaned item-only
              dashboard.
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
