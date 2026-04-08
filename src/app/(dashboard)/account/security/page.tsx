import { ChangePasswordForm } from "@/components/forms/change-password";
import PageHeader from "@/components/page-header";
import { SignOutButton } from "@/components/sign-out-button";

const page = () => {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Security"
        subtitle="Manage your account's security settings."
      />
      <ChangePasswordForm />
      <div className="border rounded-lg p-4 pt-3 border-destructive bg-destructive/2.5 max-w-lg">
        <div className="flex flex-col gap-1 mb-4">
          <h2 className="text-lg font-bold">Sign out</h2>
          <p className="text-sm text-muted-foreground">
            End your current session on this device.
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
};

export default page;
