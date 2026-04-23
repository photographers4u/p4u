import Link from "next/link";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildAdminPhotographersHref,
  getAdminPhotographerListFilters,
  getAdminPhotographerSortLabel,
  getAdminPhotographerStatusFilterLabel,
} from "@/lib/admin-photographer-list";
import {
  getPhotographerStatusViewModel,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import type { SearchParamsRecord } from "@/lib/search-params";
import {
  ADMIN_PHOTOGRAPHER_LIST_SORTS,
  ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  getAdminPhotographerEntriesPage,
} from "@/server/services/photographer";
import { ONBOARDING_STEPS } from "@/zod/helpers";

const adminDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

type AdminPhotographersPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

function getSpecialitiesLabel(count: number) {
  if (count === 0) {
    return "No services";
  }

  return `${count} ${count === 1 ? "speciality" : "specialities"}`;
}

function getUploadsLabel(count: number) {
  if (count === 0) {
    return "No uploads";
  }

  return `${count} ${count === 1 ? "image" : "images"}`;
}

export default async function AdminPhotographersPage({
  searchParams,
}: AdminPhotographersPageProps) {
  const params = await searchParams;
  const filters = getAdminPhotographerListFilters(params);
  const { entries, page, pageSize, totalCount, totalPages } =
    await getAdminPhotographerEntriesPage(filters);
  const activeFilters = {
    ...filters,
    page,
  };
  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.status !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS ||
    filters.sort !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : rangeStart + entries.length - 1;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Photographers"
        subtitle="Review photographer submissions with paginated results, SQL-backed filters, and a queue order that keeps active reviews first."
      />

      <Card className="border border-border/70 shadow-sm">
        <CardContent className="pt-6">
          <form
            method="get"
            className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_220px_220px_auto]"
          >
            <input type="hidden" name="page" value="1" />

            <div className="space-y-1.5">
              <label
                htmlFor="admin-photographer-search"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Search
              </label>
              <Input
                id="admin-photographer-search"
                name="q"
                defaultValue={filters.query}
                placeholder="Search by photographer name or email"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-photographer-status"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Status
              </label>
              <select
                id="admin-photographer-status"
                name="status"
                defaultValue={filters.status}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {ADMIN_PHOTOGRAPHER_LIST_STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {getAdminPhotographerStatusFilterLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-photographer-sort"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Sort
              </label>
              <select
                id="admin-photographer-sort"
                name="sort"
                defaultValue={filters.sort}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {ADMIN_PHOTOGRAPHER_LIST_SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {getAdminPhotographerSortLabel(sort)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="h-10">
                Apply
              </Button>
              <Button asChild variant="outline" className="h-10">
                <Link href="/admin/photographers">Clear</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {entries.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
          <h2 className="text-xl font-semibold">
            {hasActiveFilters
              ? "No photographer entries match these filters"
              : "No photographer entries yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try widening the search, changing the status filter, or resetting the sort."
              : "Photographer submissions will appear here once onboarding starts."}
          </p>
          {hasActiveFilters ? (
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/admin/photographers">Reset filters</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <Card className="border border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {rangeStart}-{rangeEnd} of {totalCount} photographer
                {totalCount === 1 ? "" : "s"}
              </p>
              <p>
                {getAdminPhotographerStatusFilterLabel(filters.status)} |{" "}
                {getAdminPhotographerSortLabel(filters.sort)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20 text-left">
                    <th className="px-4 py-3 font-medium text-foreground">
                      Profile
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Services
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Portfolio
                    </th>
                    <th className="px-4 py-3 font-medium text-foreground">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const returnTo = buildAdminPhotographersHref(activeFilters);
                    const detailParams = new URLSearchParams({
                      returnTo,
                    });
                    const href = `/admin/photographer/${entry.id}?${detailParams.toString()}`;
                    const status = getPhotographerStatusViewModel(entry);

                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-border/60 last:border-b-0 hover:bg-muted/10"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="flex items-center gap-3 rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-sm font-semibold text-foreground/80">
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
                            <div className="min-w-0 space-y-1">
                              <p className="truncate font-medium text-foreground transition hover:text-primary">
                                {entry.name ?? "Untitled photographer profile"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Step {entry.onboardingStep} of{" "}
                                {ONBOARDING_STEPS.length}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <p className="text-muted-foreground transition hover:text-foreground">
                              {entry.contact?.email ?? "No email added yet"}
                            </p>
                            {entry.contact ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {entry.contact.emailVerified
                                  ? "Verified contact email"
                                  : "Unverified contact email"}
                              </p>
                            ) : null}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex flex-col gap-1">
                              <Badge variant={status.badgeVariant}>
                                {status.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {entry.isPublished
                                  ? "Visible publicly"
                                  : "Hidden"}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <p>
                              {getSpecialitiesLabel(entry.specialitiesCount)}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="flex items-center gap-3 rounded-2xl px-1 py-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-[11px] font-medium text-muted-foreground">
                              {entry.portfolioPreview ? (
                                <>
                                  {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                                  <img
                                    src={entry.portfolioPreview}
                                    alt={`${entry.name ?? "Photographer"} portfolio preview`}
                                    className="h-full w-full object-cover"
                                  />
                                </>
                              ) : (
                                entry.uploadsCount
                              )}
                            </div>
                            <div className="space-y-1">
                              <p>{getUploadsLabel(entry.uploadsCount)}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.portfolioPreview
                                  ? "Preview available"
                                  : "No preview yet"}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={href}
                            className="block rounded-2xl px-1 py-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <p>{adminDateFormatter.format(entry.updatedAt)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Created{" "}
                              {adminDateFormatter.format(entry.createdAt)}
                            </p>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                {hasPreviousPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={buildAdminPhotographersHref(activeFilters, {
                        page: page - 1,
                      })}
                    >
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                )}

                {hasNextPage ? (
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={buildAdminPhotographersHref(activeFilters, {
                        page: page + 1,
                      })}
                    >
                      Next
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
