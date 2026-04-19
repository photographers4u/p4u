import { headers } from "next/headers";
import Link from "next/link";
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
import {
  getSearchParamFirstValue,
  matchesSearchParamFlag,
} from "@/lib/search-params";
import { getEmailChangeErrorMessage } from "@/server/account/email-change";
import { getAccountOverview } from "@/server/services/account";

type AccountPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AccountNotice = {
  message: string;
  tone: "error" | "info" | "success";
};

function getAccountNotice(
  params: Record<string, string | string[] | undefined>,
): AccountNotice | null {
  const emailChangeError = getEmailChangeErrorMessage(
    getSearchParamFirstValue(params.emailChangeError),
  );

  if (emailChangeError) {
    return {
      message: emailChangeError,
      tone: "error",
    };
  }

  if (matchesSearchParamFlag(params.emailChanged)) {
    return {
      message: matchesSearchParamFlag(params.verificationEmailSent)
        ? "Your email was changed and we sent a verification link to the new address."
        : "Your email was changed, but we couldn't send the verification email automatically.",
      tone: matchesSearchParamFlag(params.verificationEmailSent)
        ? "success"
        : "info",
    };
  }

  return null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const account = await getAccountOverview(requestHeaders);

  if (!account?.user) {
    redirect("/login");
  }

  const notice = getAccountNotice(params);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account"
        subtitle="Review your sign-in details, email status, and current account access."
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
              Review the account details tied to your photographer workspace.
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
              <p className="text-sm text-muted-foreground">Email status</p>
              <p className="mt-1 text-base font-medium">
                {account.user.emailVerified
                  ? "Verified"
                  : "Verification required"}
              </p>
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
            {!account.user.emailVerified ? (
              <div className="rounded-3xl border bg-amber-50 p-4 text-sm text-amber-950 sm:col-span-2 dark:bg-amber-950/30 dark:text-amber-100">
                Your email still needs verification before email-password
                sign-in is fully available.{" "}
                <Link
                  href={`/email-verification?email=${encodeURIComponent(account.user.email)}`}
                  className="underline underline-offset-4"
                >
                  Resend the verification email
                </Link>
                .
              </div>
            ) : null}
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
              You are currently signed in and can continue managing your
              photographer account from the dashboard.
            </div>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
