export const ADMIN_PANEL_ROLES = ["admin", "sales"] as const;

export type AdminPanelRole = (typeof ADMIN_PANEL_ROLES)[number];

export function isAdminPanelRole(role?: string | null): role is AdminPanelRole {
  return (ADMIN_PANEL_ROLES as readonly string[]).includes(role ?? "");
}
