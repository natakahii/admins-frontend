import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage.jsx";
import NotFoundPage from "../features/shared/pages/NotFoundPage.jsx";
import ForbiddenPage from "../features/shared/pages/ForbiddenPage.jsx";

import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import RoleRoute from "../routes/RoleRoute.jsx";

import AppLayout from "../components/layout/AppLayout.jsx";
import AdminLayout from "../features/admin/layout/AdminLayout.jsx";
import SuperAdminLayout from "../features/superAdmin/layout/SuperAdminLayout.jsx";

import AdminDashboardPage from "../features/admin/pages/DashboardPage.jsx";
import UsersPage from "../features/admin/pages/UsersPage.jsx";
import VendorsPage from "../features/admin/pages/VendorsPage.jsx";
import VendorApplicationsPage from "../features/admin/pages/VendorApplicationsPage.jsx";
import ProductsPage from "../features/admin/pages/ProductsPage.jsx";
import CategoriesPage from "../features/admin/pages/CategoriesPage.jsx";
import OrdersPage from "../features/admin/pages/OrdersPage.jsx";
import PaymentsPage from "../features/admin/pages/PaymentsPage.jsx";
import EscrowPage from "../features/admin/pages/EscrowPage.jsx";
import RefundsPage from "../features/admin/pages/RefundsPage.jsx";
import ShipmentsPage from "../features/admin/pages/ShipmentsPage.jsx";
import DisputesPage from "../features/admin/pages/DisputesPage.jsx";
import SupportTicketsPage from "../features/admin/pages/SupportTicketsPage.jsx";
import ReportsPage from "../features/admin/pages/ReportsPage.jsx";
import AdminAnalyticsPage from "../features/admin/pages/AnalyticsOverviewPage.jsx";

import SuperAdminAccountsPage from "../features/superAdmin/pages/AdminAccountsPage.jsx";
import SuperSettingsPage from "../features/superAdmin/pages/SettingsPage.jsx";
import PlatformFeesPage from "../features/superAdmin/pages/PlatformFeesPage.jsx";
import SubscriptionPlansPage from "../features/superAdmin/pages/SubscriptionPlansPage.jsx";
import AuditLogsPage from "../features/superAdmin/pages/AuditLogsPage.jsx";

export const router = createBrowserRouter([
  // Landing page = Login only
  { path: "/", element: <LoginPage /> },

  // App layout protected
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      // Admin routes (normal_admin + super_admin)
      {
        path: "admin",
        element: (
          <RoleRoute allow={["normal_admin", "super_admin"]}>
            <AdminLayout />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "vendors", element: <VendorsPage /> },
          { path: "vendor-applications", element: <VendorApplicationsPage /> },
          { path: "products", element: <ProductsPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "escrow", element: <EscrowPage /> },
          { path: "refunds", element: <RefundsPage /> },
          { path: "shipments", element: <ShipmentsPage /> },
          { path: "disputes", element: <DisputesPage /> },
          { path: "support", element: <SupportTicketsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "analytics", element: <AdminAnalyticsPage /> }
        ]
      },

      // Super admin routes (super_admin only)
      {
        path: "super",
        element: (
          <RoleRoute allow={["super_admin"]}>
            <SuperAdminLayout />
          </RoleRoute>
        ),
        children: [
          { index: true, element: <Navigate to="admins" replace /> },
          { path: "admins", element: <SuperAdminAccountsPage /> },
          { path: "settings", element: <SuperSettingsPage /> },
          { path: "platform-fees", element: <PlatformFeesPage /> },
          { path: "subscription-plans", element: <SubscriptionPlansPage /> },
          { path: "audit-logs", element: <AuditLogsPage /> }
        ]
      }
    ]
  },

  { path: "/forbidden", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> }
]);
