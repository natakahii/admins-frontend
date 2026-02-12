import React, { useEffect } from "react";

export default function Toast({ open, tone = "info", message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 3500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`toast toast--${tone}`} role="status">
      <span>{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}
