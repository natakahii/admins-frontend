import { api } from "../../../services/apiClient.js";

export const adminApi = {
  dashboard() {
    return api.get("/api/v1/admin/dashboard").then((r) => r.data);
  },

  categories(params) {
    return api.get("/api/v1/admin/categories", { params }).then((r) => r.data);
  },
  createCategory(payload) {
    return api.post("/api/v1/admin/categories", payload).then((r) => r.data);
  },
  updateCategory(categoryId, payload) {
    return api.patch(`/api/v1/admin/categories/${categoryId}`, payload).then((r) => r.data);
  },
  deleteCategory(categoryId) {
    return api.delete(`/api/v1/admin/categories/${categoryId}`).then((r) => r.data);
  },

  users(params) {
    return api.get("/api/v1/admin/users", { params }).then((r) => r.data);
  },
  updateUserStatus(userId, payload) {
    return api.patch(`/api/v1/admin/users/${userId}/status`, payload).then((r) => r.data);
  },
  verifyUser(userId) {
    return api.post(`/api/v1/admin/users/${userId}/verify`).then((r) => r.data);
  },

  vendors(params) {
    return api.get("/api/v1/admin/vendors", { params }).then((r) => r.data);
  },
  roles(params) {
    return api.get("/api/v1/admin/roles", { params }).then((r) => r.data);
  },
  reviewVendorVerification(vendorId, payload) {
    return api.post(`/api/v1/admin/vendors/${vendorId}/verification/review`, payload).then((r) => r.data);
  },

  products(params) {
    return api.get("/api/v1/admin/products", { params }).then((r) => r.data);
  },
  moderateProduct(productId, payload) {
    return api.patch(`/api/v1/admin/products/${productId}/moderation`, payload).then((r) => r.data);
  },
  productDetail(productId) {
    return api.get(`/api/v1/products/${productId}`).then((r) => r.data);
  },

  orders(params) {
    return api.get("/api/v1/admin/orders", { params }).then((r) => r.data);
  },
  payments(params) {
    return api.get("/api/v1/admin/payments", { params }).then((r) => r.data);
  },

  escrowByOrder(orderId) {
    return api.get(`/api/v1/admin/escrow/orders/${orderId}`).then((r) => r.data);
  },

  createRefund(payload) {
    return api.post("/api/v1/admin/refunds", payload).then((r) => r.data);
  },

  shipments(params) {
    return api.get("/api/v1/admin/shipments", { params }).then((r) => r.data);
  },
  shipmentInspections(shipmentId) {
    return api.get(`/api/v1/admin/cargo/shipments/${shipmentId}/inspections`).then((r) => r.data);
  },

  disputes(params) {
    return api.get("/api/v1/admin/disputes", { params }).then((r) => r.data);
  },
  resolveDispute(disputeId, payload) {
    return api.post(`/api/v1/admin/disputes/${disputeId}/resolve`, payload).then((r) => r.data);
  },

  supportTickets(params) {
    return api.get("/api/v1/admin/support/tickets", { params }).then((r) => r.data);
  },

  reports(params) {
    return api.get("/api/v1/admin/reports", { params }).then((r) => r.data);
  },
  actionReport(reportId, payload) {
    return api.post(`/api/v1/admin/reports/${reportId}/action`, payload).then((r) => r.data);
  },

  analyticsOverview(params) {
    return api.get("/api/v1/admin/analytics/overview", { params }).then((r) => r.data);
  }
};
