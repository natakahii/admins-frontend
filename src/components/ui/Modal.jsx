import React, { useEffect } from "react";
import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose, footer, className = "" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className={`modal${className ? ` ${className}` : ""}`}>
        <div className="modal__header">
          <div className="modal__title">{title}</div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <div className="modal__body">{children}</div>
        {footer === null ? null : (
          <div className="modal__footer">
            {footer ? footer : <Button variant="secondary" onClick={onClose}>Close</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
