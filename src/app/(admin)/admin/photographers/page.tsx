import {
  AlertTriangle,
  ArrowUpDown,
  CalendarRange,
  ListChecks,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { AdminCreatePhotographerDialog } from "@/components/admin/admin-create-photographer-dialog";
import { AdminPhotographerFeatureToggle } from "@/components/review-workflow/admin-photographer-feature-toggle";
import { AdminPhotographerInlineReviewActions } from "@/components/review-workflow/admin-photographer-inline-review-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADMIN_PHOTOGRAPHER_STALE_THRESHOLD_DAYS,
  buildAdminPhotographersHref,
  getAdminPhotographerListFilters,
  getAdminPhotographerSortLabel,
  getAdminPhotographerStageFilterLabel,
} from "@/lib/admin-photographer-list";
import {
  getPhotographerStatusViewModel,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import type { SearchParamsRecord } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import {
  ADMIN_PHOTOGRAPHER_LIST_CITIES,
  ADMIN_PHOTOGRAPHER_LIST_SORTS,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  getAdminPhotographerEntriesPage,
  getAdminPhotographerQuickFilterCounts,
} from "@/server/services/photographer";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type { AdminPhotographerListFilters } from "@/zod/schema/photographer";

const adminDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});
const numberFormatter = new Intl.NumberFormat("en");

const NON_TERMINAL_STATUSES = new Set([
  "submitted",
  "pending_verification",
  "on_hold",
]);

function getStuckInfo(
  status: string | null,
  updatedAt: Date,
): { isStale: boolean; text: string } | null {
  if (!status || !NON_TERMINAL_STATUSES.has(status)) {
    return null;
  }

  const days = Math.floor(
    (Date.now() - updatedAt.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (days < 1) {
    return null;
  }

  return {
    isStale: days >= ADMIN_PHOTOGRAPHER_STALE_THRESHOLD_DAYS,
    text: `Stuck ${days}d`,
  };
}

type AdminPhotographersPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AdminPhotographersPage({
  searchParams,
}: AdminPhotographersPageProps) {
  const params = await searchParams;
  const filters = getAdminPhotographerListFilters(params);
  const [{ entries, page, pageSize, totalCount, totalPages }, quickCounts] =
    await Promise.all([
      getAdminPhotographerEntriesPage({
        ...filters,
        createdFrom: filters.createdFrom
          ? new Date(filters.createdFrom)
          : undefined,
        createdTo: filters.createdTo ? new Date(filters.createdTo) : undefined,
      }),
      getAdminPhotographerQuickFilterCounts(),
    ]);
  const activeFilters = {
    ...filters,
    page,
  };
  const hasActiveFilters =
    Boolean(filters.query) ||
    filters.status !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS ||
    filters.sort !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT ||
    filters.city !== "all" ||
    filters.onboardingStep !== "all" ||
    Boolean(filters.createdFrom) ||
    Boolean(filters.createdTo) ||
    filters.stale;
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = totalCount === 0 ? 0 : rangeStart + entries.length - 1;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const baseFilters: AdminPhotographerListFilters = {
    page: 1,
    query: "",
    sort: DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
    status: DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
    city: "all",
    onboardingStep: "all",
    stale: false,
  };
  const quickFilters = [
    {
      count: quickCounts.total,
      href: buildAdminPhotographersHref(baseFilters),
      isActive: !hasActiveFilters,
      label: "All",
      tone: "default" as const,
    },
    {
      count: quickCounts.submitted,
      href: buildAdminPhotographersHref(baseFilters, { status: "submitted" }),
      isActive: filters.status === "submitted" && !filters.stale,
      label: "Submitted",
      tone: "default" as const,
    },
    {
      count: quickCounts.pendingVerification,
      href: buildAdminPhotographersHref(baseFilters, {
        status: "pending_verification",
      }),
      isActive: filters.status === "pending_verification" && !filters.stale,
      label: "Pending verification",
      tone: "default" as const,
    },
    {
      count: quickCounts.onHold,
      href: buildAdminPhotographersHref(baseFilters, { status: "on_hold" }),
      isActive: filters.status === "on_hold" && !filters.stale,
      label: "On hold",
      tone: "default" as const,
    },
    {
      count: quickCounts.stale,
      href: buildAdminPhotographersHref(baseFilters, { stale: true }),
      isActive: filters.stale,
      label: `Stale · ${ADMIN_PHOTOGRAPHER_STALE_THRESHOLD_DAYS}d+`,
      tone: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Photographers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {numberFormatter.format(quickCounts.total)} profiles across every
            stage of onboarding
          </p>
        </div>
        <AdminCreatePhotographerDialog />
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {quickFilters.map((preset) => (
          <Link
            key={preset.label}
            href={preset.href}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors",
              preset.isActive
                ? preset.tone === "warning"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-primary/30 bg-primary text-primary-foreground"
                : preset.tone === "warning"
                  ? "border-destructive/20 text-destructive/80 hover:bg-destructive/5"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950",
            )}
          >
            {preset.tone === "warning" ? (
              <AlertTriangle className="size-3.5" />
            ) : null}
            {preset.label}
            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs tabular-nums",
                preset.isActive
                  ? "bg-background/20"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {numberFormatter.format(preset.count)}
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <form method="get" className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="page" value="1" />

          <div className="relative order-1 w-full sm:w-64 md:flex-1 md:basis-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              defaultValue={filters.query}
              placeholder="Search by name or email"
              className="h-10 rounded-full border-slate-200 bg-white pl-9 shadow-none"
            />
          </div>

          <Select name="status" defaultValue={filters.status}>
            <SelectTrigger className="order-2 h-10 rounded-full">
              <SlidersHorizontal className="size-4 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="pending_verification">
                Pending Verification
              </SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>

          <Select name="city" defaultValue={filters.city}>
            <SelectTrigger className="order-3 h-10 rounded-full">
              <MapPin className="size-4 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_PHOTOGRAPHER_LIST_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city === "all" ? "All cities" : city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="stage" defaultValue={String(filters.onboardingStep)}>
            <SelectTrigger className="order-4 h-10 rounded-full">
              <ListChecks className="size-4 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {ONBOARDING_STEPS.map((step) => (
                <SelectItem key={step} value={String(step)}>
                  {getAdminPhotographerStageFilterLabel(step)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="sort" defaultValue={filters.sort}>
            <SelectTrigger className="order-5 h-10 rounded-full">
              <ArrowUpDown className="size-4 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_PHOTOGRAPHER_LIST_SORTS.map((sort) => (
                <SelectItem key={sort} value={sort}>
                  {getAdminPhotographerSortLabel(sort)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="order-6 flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm shadow-sm">
            <CalendarRange className="size-4 shrink-0 text-slate-400" />
            <input
              type="date"
              name="from"
              defaultValue={filters.createdFrom ?? ""}
              aria-label="Created from"
              className="w-26 bg-transparent text-sm text-slate-950 outline-none"
            />
            <span className="text-slate-400">–</span>
            <input
              type="date"
              name="to"
              defaultValue={filters.createdTo ?? ""}
              aria-label="Created to"
              className="w-26 bg-transparent text-sm text-slate-950 outline-none"
            />
          </div>

          <label className="order-7 inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm text-slate-950 shadow-sm transition-colors has-checked:border-destructive/40 has-checked:bg-destructive/10 has-checked:text-destructive">
            <input
              type="checkbox"
              name="stale"
              value="1"
              defaultChecked={filters.stale}
              className="sr-only"
            />
            <AlertTriangle className="size-4" />
            Stale only
          </label>

          <div className="order-8 flex items-center gap-2">
            <Button type="submit" className="h-10 rounded-full">
              Apply
            </Button>
            {hasActiveFilters ? (
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-full text-slate-500"
              >
                <Link href="/admin/photographers">
                  <X className="size-4" />
                  Clear
                </Link>
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold text-slate-950">
            {hasActiveFilters
              ? "No photographer entries match these filters"
              : "No photographer entries yet"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {hasActiveFilters
              ? "Try widening the search, changing filters, or resetting them."
              : "Photographer submissions will appear here once onboarding starts."}
          </p>
          {hasActiveFilters ? (
            <div className="mt-5">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/admin/photographers">Reset filters</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <section className="overflow-hidden rounded-lg border border-slate-200">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              Showing{" "}
              <span className="font-medium text-slate-950">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              of {totalCount} photographer
              {totalCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-350 table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-65 px-5 py-3 sm:px-6">Photographer</th>
                  <th className="w-27 px-5 py-3">City</th>
                  <th className="w-75 px-5 py-3">Status</th>
                  <th className="w-56 px-5 py-3">Contact</th>
                  <th className="w-33 px-5 py-3">Updated</th>
                  <th className="w-52 px-5 py-3">Visibility</th>
                  <th className="w-42 px-5 py-3 text-right sm:px-6">Action</th>
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
                  const stuck = getStuckInfo(entry.status, entry.updatedAt);
                  const secondaryStatusLine = stuck
                    ? {
                        className: stuck.isStale
                          ? "text-xs font-medium text-destructive"
                          : "text-xs text-slate-500",
                        text: stuck.text,
                      }
                    : {
                        className: "text-xs text-slate-500",
                        text: entry.reviewedAt
                          ? `Reviewed ${adminDateFormatter.format(entry.reviewedAt)}`
                          : "Not reviewed yet",
                      };

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5 align-top sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-black/5">
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
                              className="block truncate font-semibold text-slate-950 transition hover:text-primary"
                            >
                              {entry.name ?? "Untitled photographer profile"}
                            </Link>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Step {entry.onboardingStep} of{" "}
                              {ONBOARDING_STEPS.length}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          {entry.locationCity ? (
                            <>
                              <MapPin className="size-3.5 shrink-0" />
                              {entry.locationCity}
                            </>
                          ) : (
                            "—"
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="space-y-1.5">
                          <Badge
                            variant={status.badgeVariant}
                            className="h-auto max-w-full whitespace-normal text-center"
                          >
                            {status.label}
                          </Badge>
                          <p className={secondaryStatusLine.className}>
                            {secondaryStatusLine.text}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="space-y-1">
                          <p
                            className="truncate text-slate-950"
                            title={entry.contact?.email ?? undefined}
                          >
                            {entry.contact?.email ??
                              "No contact email added yet"}
                          </p>
                          <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                entry.contact?.emailVerified
                                  ? "bg-emerald-500"
                                  : "bg-slate-300",
                              )}
                            />
                            {entry.contact
                              ? entry.contact.emailVerified
                                ? "Verified email"
                                : "Unverified email"
                              : "Contact details missing"}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="space-y-0.5 text-slate-500">
                          <p>{adminDateFormatter.format(entry.updatedAt)}</p>
                          <p className="text-xs">
                            Created {adminDateFormatter.format(entry.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              entry.isPublished ? "secondary" : "outline"
                            }
                          >
                            {entry.isPublished ? "Live" : "Hidden"}
                          </Badge>
                          <AdminPhotographerFeatureToggle
                            photographerId={entry.id}
                            isFeatured={entry.isFeatured}
                            size="sm"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 align-top sm:px-6">
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={href}>Review</Link>
                          </Button>
                          <AdminPhotographerInlineReviewActions
                            photographerId={entry.id}
                            photographerName={entry.name ?? ""}
                            status={entry.status ?? "draft"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {hasPreviousPage ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
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
                  className="rounded-full"
                >
                  Previous
                </Button>
              )}

              {hasNextPage ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full"
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
                  className="rounded-full"
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
