import React from "react";
import Button from "../../../components/ui/Button.jsx";

export default function NotFoundPage() {
  return (
    <div className="pageCenter">
      <div className="pageCenter__card">
        <div className="pageCenter__title">Page not found</div>
        <div className="muted">The page you are trying to access doesn’t exist.</div>
        <div style={{ marginTop: 16 }}>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
