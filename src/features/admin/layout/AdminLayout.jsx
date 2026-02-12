import React from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="adminLayout">
      <div className="adminLayout__inner">
        <Outlet />
      </div>
    </div>
  );
}

