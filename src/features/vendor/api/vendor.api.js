import { api } from "../../../services/apiClient.js";

export const vendorApi = {
  async createProfile(payload) {
    const res = await api.post("/api/v1/vendor/profile", payload);
    return res.data;
  }
};
