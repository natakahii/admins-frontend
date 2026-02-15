import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { adminNav } from "../../config/nav.admin.js";
import { superAdminNav } from "../../config/nav.superAdmin.js";
import { useAuth } from "../../app/providers/authContext.js";
import { adminApi } from "../../features/admin/api/admin.api.js";

export default function AppLayout() {
  const { adminRole } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSidebarOpen(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("isSidebarOpen");
    else document.body.classList.remove("isSidebarOpen");
    return () => document.body.classList.remove("isSidebarOpen");
  }, [sidebarOpen]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setSidebarOpen(false);
    }

    if (!sidebarOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  const nav = useMemo(() => {
    const base = [...adminNav];
    if (adminRole === "super_admin") {
      base.push({ label: "— Super Admin —", path: "", icon: "divider" });
      base.push(...superAdminNav);
    }
    return base;
  }, [adminRole]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const res = await adminApi.categories();
        const list = res?.categories || res?.data || res || [];
        if (!cancelled) {
          setCategories(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (!cancelled) {
          setCategoriesError(err?.response?.data?.message || "Failed to load categories.");
          setCategories([]);
        }
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    }

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const sectionTitle = useMemo(() => {
    if (location.pathname.includes("/app/super/")) return "Super Admin";
    return "Admin";
  }, [location.pathname]);

  useEffect(() => {
    const isDashboard = location.pathname === "/app/admin/dashboard";
    document.title = isDashboard ? "Admin Dashboard" : "Natakahii Admin";
  }, [location.pathname]);

  return (
    <div className="shell">
      <div
        className={`sidebarOverlay ${sidebarOpen ? "sidebarOverlay--open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />
      <Sidebar
        nav={nav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
      />
      <div className="shell__main">
        <Topbar
          sectionTitle={sectionTitle}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />
        <div className="shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
