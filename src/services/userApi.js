import { api } from "../../../services/apiClient.js";

export const userApi = {
  // Profile
  updateProfile(payload) {
    return api.patch("/api/v1/profile", payload).then((r) => r.data);
  },

  updatePhoto(formData) {
    return api.post("/api/v1/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }).then((r) => r.data);
  },

  deletePhoto() {
    return api.delete("/api/v1/profile/photo").then((r) => r.data);
  },

  // Vendor Application
  vendorApplicationStatus() {
    return api.get("/api/v1/vendor-application/status").then((r) => r.data);
  },

  submitVendorApplication(payload) {
    return api.post("/api/v1/vendor-application", payload).then((r) => r.data);
  },
};
