import { Search } from "lucide-react";
import Link from "next/link";
import { AdminPhotographerFeatureToggle } from "@/components/review-workflow/admin-photographer-feature-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <section className="pb-6">
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
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-photographer-search"
                name="q"
                defaultValue={filters.query}
                placeholder="Search by photographer name or email"
                className="h-11 rounded-lg border-border/70 pl-9 shadow-none"
              />
            </div>
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
              className="h-11 w-full rounded-lg border border-input border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              className="h-11 w-full rounded-lg border border-input border-border/70 bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {ADMIN_PHOTOGRAPHER_LIST_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {getAdminPhotographerSortLabel(sort)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" className="h-11 rounded-lg">
              Apply
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-lg">
              <Link href="/admin/photographers">Clear</Link>
            </Button>
          </div>
        </form>
      </section>

      {entries.length === 0 ? (
        <div className="border-t border-dashed border-border/70 px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">
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
            <div className="mt-5">
              <Button asChild variant="outline" className="rounded-lg">
                <Link href="/admin/photographers">Reset filters</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <section className="border-t border-border/70">
          <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              Showing {rangeStart}-{rangeEnd} of {totalCount} photographer
              {totalCount === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {getAdminPhotographerStatusFilterLabel(filters.status)}
              </Badge>
              <Badge variant="outline">
                {getAdminPhotographerSortLabel(filters.sort)}
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th className="px-5 py-3 font-medium text-foreground sm:px-6">
                    Photographer
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Contact
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Updated
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Visibility
                  </th>
                  <th className="px-5 py-3 font-medium text-foreground">
                    Featured
                  </th>
                  <th className="px-5 py-3 text-right font-medium text-foreground sm:px-6">
                    Action
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
                  const reviewedLabel = entry.reviewedAt
                    ? `Reviewed ${adminDateFormatter.format(entry.reviewedAt)}`
                    : "Not reviewed yet";

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/5"
                    >
                      <td className="px-5 py-4 align-top sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-sm font-semibold text-foreground/80">
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

                          <div className="min-w-0">
                            <Link
                              href={href}
                              className="block truncate font-semibold text-foreground transition hover:text-primary"
                            >
                              {entry.name ?? "Untitled photographer profile"}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Step {entry.onboardingStep} of{" "}
                              {ONBOARDING_STEPS.length}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-2">
                          <Badge variant={status.badgeVariant}>
                            {status.label}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {reviewedLabel}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1">
                          <p className="text-foreground">
                            {entry.contact?.email ??
                              "No contact email added yet"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.contact
                              ? entry.contact.emailVerified
                                ? "Verified email"
                                : "Unverified email"
                              : "Contact details missing"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="space-y-1 text-muted-foreground">
                          <p>{adminDateFormatter.format(entry.updatedAt)}</p>
                          <p className="text-xs">
                            Created {adminDateFormatter.format(entry.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <Badge
                          variant={entry.isPublished ? "secondary" : "outline"}
                        >
                          {entry.isPublished ? "Live" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <AdminPhotographerFeatureToggle
                          photographerId={entry.id}
                          isFeatured={entry.isFeatured}
                        />
                      </td>
                      <td className="px-5 py-4 text-right align-top sm:px-6">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={href}>Review</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {hasPreviousPage ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Link
                    href={buildAdminPhotographersHref(activeFilters, {
                      page: page - 1,
                    })}
                  >
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="rounded-lg"
                >
                  Previous
                </Button>
              )}

              {hasNextPage ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <Link
                    href={buildAdminPhotographersHref(activeFilters, {
                      page: page + 1,
                    })}
                  >
                    Next
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="rounded-lg"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
