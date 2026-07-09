import { AdminCreateStaffDialog } from "@/components/admin/admin-create-staff-dialog";
import { Badge } from "@/components/ui/badge";
import { listAdminStaff } from "@/server/services/admin-staff";

const adminDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const roleLabels: Record<string, string> = {
  admin: "Admin",
  sales: "Sales",
};

export default async function AdminTeamPage() {
  const staff = await listAdminStaff();

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between gap-4 pb-2">
        <h1 className="text-xl font-semibold text-foreground">
          Staff accounts
        </h1>
        <AdminCreateStaffDialog />
      </section>

      {staff.length === 0 ? (
        <div className="border-t border-dashed border-border/70 px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No staff accounts yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add an admin or sales login to get started.
          </p>
        </div>
      ) : (
        <section className="border-t border-border/70">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th className="px-5 py-3 font-medium text-foreground sm:px-6">
                    Name
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Email
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Role
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border/60 transition-colors hover:bg-muted/5"
                  >
                    <td className="px-5 py-4 align-top font-medium text-foreground sm:px-6">
                      {member.name}
                    </td>
                    <td className="px-5 py-4 align-top text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Badge variant="outline">
                        {roleLabels[member.role ?? ""] ?? "Staff"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 align-top text-muted-foreground">
                      {adminDateFormatter.format(member.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
