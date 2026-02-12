import React from "react";

export default function Select({ label, hint, error, children, ...props }) {
  return (
    <label className="field">
      {label ? <span className="field__label">{label}</span> : null}
      <select className={`select ${error ? "select--error" : ""}`} {...props}>
        {children}
      </select>
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
