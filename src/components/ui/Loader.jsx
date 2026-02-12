import React from "react";

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader">
      <span className="spinner" aria-hidden />
      <span className="muted">{label}</span>
    </div>
  );
}
