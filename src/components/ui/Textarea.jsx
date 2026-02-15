import React from "react";

export default function Textarea({ label, hint, error, ...props }) {
  return (
    <label className="field">
      {label ? <span className="field__label">{label}</span> : null}
      <textarea className={`textarea ${error ? "textarea--error" : ""}`} {...props} />
      {hint ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  );
}
