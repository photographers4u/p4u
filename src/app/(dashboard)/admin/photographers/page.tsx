import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { photographerController } from "@/server/db/controller/photographer";

function getProfileInitials(name: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getStatusDetails(entry: {
  status: "pending" | "approved" | "rejected" | "on_hold";
  isPublished: boolean;
  contact: { email: string } | null;
}) {
  if (entry.status === "approved" || entry.isPublished) {
    return {
      label: "Approved",
      variant: "default" as const,
    };
  }

  if (entry.status === "on_hold") {
    return {
      label: "On hold",
      variant: "destructive" as const,
    };
  }

  if (entry.status === "rejected") {
    return {
      label: "Rejected",
      variant: "destructive" as const,
    };
  }

  if (entry.contact) {
    return {
      label: "Pending review",
      variant: "secondary" as const,
    };
  }

  return {
    label: "Draft",
    variant: "outline" as const,
  };
}

export default async function AdminPhotographersPage() {
  const entries = await photographerController.getAdminPhotographerEntries();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Photographers"
        subtitle="Review photographer submissions from a simple admin table."
      />

      {entries.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
          <h2 className="text-xl font-semibold">No photographer entries yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Photographer submissions will appear here once onboarding starts.
          </p>
        </div>
      ) : (
        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20 text-left">
                    <th className="px-4 py-3 font-medium text-foreground">
                      Profile picture
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const href = `/admin/photographer/${entry.id}`;
                    const status = getStatusDetails(entry);

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-border/60 last:border-b-0 hover:bg-muted/10"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-muted text-sm font-semibold text-foreground/80">
                              {entry.avatar ? (
                                <>
                                  {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                                  <img
                                    src={entry.avatar}
                                    alt={entry.name ?? "Photographer avatar"}
                                    className="h-full w-full object-cover"
                                  />
                                </>
                              ) : (
                                getProfileInitials(entry.name)
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 font-medium text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {entry.name ?? "Untitled photographer profile"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {entry.contact?.email ?? "No email added yet"}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
