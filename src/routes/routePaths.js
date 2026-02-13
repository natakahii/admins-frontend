// src/routes/routePaths.js

/**
 * Centralized route paths for NatakaHii Admin + Super Admin.
 * Keep ALL URL paths here to avoid hardcoding in components.
 */

export const ROUTE_PATHS = Object.freeze({
  // Public / auth
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password", // optional (if you build it)
  RESET_PASSWORD: "/reset-password",   // optional

  // Common protected
  APP: "/app",
  DASHBOARD: "/app/dashboard",
  PROFILE: "/app/profile", 

  // Normal Admin (Operational)
  ADMIN: "/app/admin",
  ADMIN_DASHBOARD: "/app/admin/dashboard",
  ADMIN_USERS: "/app/admin/users",
  ADMIN_VENDORS: "/app/admin/vendors",
  ADMIN_PRODUCTS: "/app/admin/products",
  ADMIN_ORDERS: "/app/admin/orders",
  ADMIN_PAYMENTS: "/app/admin/payments",
  ADMIN_ESCROW: "/app/admin/escrow",
  ADMIN_REFUNDS: "/app/admin/refunds",
  ADMIN_SHIPMENTS: "/app/admin/shipments",
  ADMIN_DISPUTES: "/app/admin/disputes",
  ADMIN_SUPPORT: "/app/admin/support",
  ADMIN_REPORTS: "/app/admin/reports",
  ADMIN_DELIVERY_RUNS: "/app/admin/delivery-runs",
  ADMIN_ANALYTICS: "/app/admin/analytics",

  // Super Admin (Full Control)
  SUPER: "/app/super",
  SUPER_ADMINS: "/app/super/admins",
  SUPER_SETTINGS: "/app/super/settings",
  SUPER_PLATFORM_FEES: "/app/super/platform-fees",
  SUPER_SUBSCRIPTION_PLANS: "/app/super/subscription-plans",
  SUPER_AUDIT_LOGS: "/app/super/audit-logs",

  // Fallbacks
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "*",
});

export const DEFAULT_AFTER_LOGIN = ROUTE_PATHS.ADMIN_DASHBOARD;

/**
 * Helper: build URL with query params safely.
 * Example: buildUrl(ROUTE_PATHS.ADMIN_USERS, { status: "active", search: "john" })
 */
export function buildUrl(path, params = {}) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
    else p.set(k, String(v));
  });
  const qs = p.toString();
  return qs ? `${path}?${qs}` : path;
}
