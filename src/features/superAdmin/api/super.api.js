import { api } from "../../../services/apiClient.js";

export const superApi = {
  admins(params) {
    return api.get("/api/v1/admin/super/admins", { params }).then((r) => r.data);
  },
  grantAdmin(payload) {
    return api.post("/api/v1/admin/super/admins", payload).then((r) => r.data);
  },
  updateAdminRole(userId, payload) {
    return api.patch(`/api/v1/admin/super/admins/${userId}`, payload).then((r) => r.data);
  },
  revokeAdmin(userId) {
    return api.delete(`/api/v1/admin/super/admins/${userId}`).then((r) => r.data);
  },

  getSettings() {
    return api.get("/api/v1/admin/super/settings").then((r) => r.data);
  },
  updateSettings(payload) {
    return api.put("/api/v1/admin/super/settings", payload).then((r) => r.data);
  },

  savePlatformFee(payload) {
    return api.post("/api/v1/admin/super/platform-fees", payload).then((r) => r.data);
  },

  saveSubscriptionPlan(payload) {
    return api.post("/api/v1/admin/super/subscription-plans", payload).then((r) => r.data);
  },

  auditLogs(params) {
    return api.get("/api/v1/admin/super/audit-logs", { params }).then((r) => r.data);
  }
};
