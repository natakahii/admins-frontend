export function getAdminRoleFromUser(user) {
  if (!user) return null;

  // Common shapes from /api/v1/auth/me
  // user.role, user.admin_role, user.user_type
  const u = user?.user || user?.data?.user || user?.data || user;
  const role =
    u?.admin_role ||
    u?.role ||
    u?.adminRole ||
    u?.user_type ||
    u?.userType ||
    u?.type ||
    user?.admin_role ||
    user?.role ||
    user?.adminRole ||
    user?.user_type ||
    user?.userType ||
    user?.type ||
    null;

  if (!role) return null;

  const normalized = String(role)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_");

  if (normalized === "superadmin") return "super_admin";
  if (normalized === "super") return "super_admin";
  if (normalized === "admin") return "normal_admin";
  if (normalized === "normaladmin") return "normal_admin";

  // If backend returns user_type=admin plus something else, keep here
  return normalized;
}
