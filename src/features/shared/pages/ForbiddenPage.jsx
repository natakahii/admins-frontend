import React from "react";
import Button from "../../../components/ui/Button.jsx";

export default function ForbiddenPage() {
  return (
    <div className="pageCenter">
      <div className="pageCenter__card">
        <div className="pageCenter__title">Access denied</div>
        <div className="muted">You don't have permission to view this page.</div>
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
