import { api } from "../../../services/apiClient.js";

export const authApi = {
  async login(payload) {
    const res = await api.post("/api/v1/auth/login", payload);
    return res.data;
  },
  async refresh() {
    const res = await api.post("/api/v1/auth/refresh");
    return res.data;
  },
  async me() {
    const res = await api.get("/api/v1/auth/me");
    return res.data;
  },
  async logout() {
    const res = await api.post("/api/v1/auth/logout");
    return res.data;
  },
  async forgotPassword(payload) {
    const res = await api.post("/api/v1/auth/forgot-password", payload);
    return res.data;
  },
  async resetPassword(payload) {
    const res = await api.post("/api/v1/auth/reset-password", payload);
    return res.data;
  },
  async resendOtp(payload) {
    const res = await api.post("/api/v1/auth/resend-otp", payload);
    return res.data;
  }
};
