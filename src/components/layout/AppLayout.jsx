import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { adminNav } from "../../config/nav.admin.js";
import { superAdminNav } from "../../config/nav.superAdmin.js";
import { useAuth } from "../../app/providers/authContext.js";

export default function AppLayout() {
  const { adminRole } = useAuth();
  const location = useLocation();

  const nav = useMemo(() => {
    const base = [...adminNav];
    if (adminRole === "super_admin") {
      base.push({ label: "— Super Admin —", path: "", icon: "divider" });
      base.push(...superAdminNav);
    }
    return base;
  }, [adminRole]);

  const sectionTitle = useMemo(() => {
    if (location.pathname.includes("/app/super/")) return "Super Admin";
    return "Admin";
  }, [location.pathname]);

  return (
    <div className="shell">
      <Sidebar nav={nav} />
      <div className="shell__main">
        <Topbar sectionTitle={sectionTitle} />
        <div className="shell__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
