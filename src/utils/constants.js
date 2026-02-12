export function getAdminRoleFromUser(user) {
  if (!user) return null;

  // Common shapes from /api/v1/auth/me
  // user.role, user.admin_role, user.user_type
  const role = user.admin_role || user.role || user.adminRole || null;

  // If backend returns user_type=admin plus something else, keep here
  return role;
}
