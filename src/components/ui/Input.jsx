import React from "react";

export default function Input({ label, hint, error, ...props }) {
  return (
    <label className="field">
      {label ? <span className="field__label">{label}</span> : null}
      <input className={`input ${error ? "input--error" : ""}`} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
