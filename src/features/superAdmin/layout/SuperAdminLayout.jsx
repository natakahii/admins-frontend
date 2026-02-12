import React from "react";
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout() {
  return (
    <div className="superAdminLayout">
      <div className="superAdminLayout__inner">
        <Outlet />
      </div>
    </div>
  );
}

