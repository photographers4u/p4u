import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/forms/account/index";
import PageHeader from "@/components/page-header";
import { getEmailChangeErrorMessage } from "@/server/account/email-change";
import { getAccountOverview } from "@/server/services/account";

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
          : "Your email was changed, but we couldn't send the verification email automatically. Use the resend button below.",
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
  const account = await getAccountOverview(requestHeaders);

  if (!account?.user) {
    redirect("/login");
  }

  return (
    <div>
      <PageHeader
        title="Account"
        subtitle="Manage your profile details and email verification settings."
      />
      <AccountForm
        user={account.user}
        pendingEmail={account.pendingEmail}
        initialNotice={getAccountNotice(params)}
      />
    </div>
  );
}
