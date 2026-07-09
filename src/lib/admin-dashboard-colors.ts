import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

/**
 * Single source of truth for admin-dashboard chart colors. Values are CSS
 * custom properties (defined in src/app/globals.css) so they swap
 * automatically between light/dark without any client-side theme detection.
 * The underlying hex values were chosen and verified with the dataviz
 * skill's scripts/validate_palette.js against this app's real surfaces
 * (#ffffff light / #171717 dark) — see the comments in globals.css.
 */

const NEUTRAL = "var(--muted-foreground)";

export const PHOTOGRAPHER_STATUS_COLORS: Record<
  PhotographerWorkflowStatus,
  string
> = {
  draft: NEUTRAL,
  submitted: "var(--viz-blue)",
  pending_verification: "var(--viz-magenta)",
  on_hold: "var(--viz-orange)",
  rejected: "var(--viz-red)",
  approved: "var(--viz-green)",
};

// Fixed slot order for nominal categorical breakdowns (city, etc.) — assign
// in this order, never cycled or reassigned per chart.
export const CATEGORICAL_PALETTE = [
  "var(--viz-blue)",
  "var(--viz-aqua)",
  "var(--viz-green)",
  "var(--viz-red)",
  "var(--viz-orange)",
] as const;

export const OTHER_BUCKET_COLOR = NEUTRAL;

export const ROLE_COLORS: Record<string, string> = {
  user: "var(--viz-blue)",
  admin: "var(--viz-green)",
  sales: "var(--viz-orange)",
  photographer: "var(--viz-aqua)",
};

// Ordinal ramp (one hue, monotone lightness) for the 5-step onboarding
// funnel — step 1 lightest, step 5 darkest.
export const ONBOARDING_FUNNEL_COLORS = [
  "var(--viz-funnel-1)",
  "var(--viz-funnel-2)",
  "var(--viz-funnel-3)",
  "var(--viz-funnel-4)",
  "var(--viz-funnel-5)",
] as const;

export const PHOTOGRAPHER_SIGNUPS_COLOR = "var(--viz-blue)";
export const USER_SIGNUPS_COLOR = "var(--viz-green)";
export const SPECIALITY_BAR_COLOR = "var(--viz-blue)";

// Photographer-facing growth dashboard (src/app/(dashboard)/dashboard/overview)
export const PROFILE_VIEWS_COLOR = "var(--viz-blue)";
export const CONTACT_CALL_COLOR = "var(--viz-green)";
export const CONTACT_EMAIL_COLOR = "var(--viz-orange)";
