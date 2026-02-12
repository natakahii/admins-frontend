import React from "react";

export default function Button({
  children,
  variant = "primary", // primary=orange, secondary=blue outline, ghost=text
  size = "md",
  loading = false,
  disabled = false,
  ...props
}) {
  const cls = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    loading ? "btn--loading" : ""
  ].join(" ");

  return (
    <button className={cls} disabled={disabled || loading} {...props}>
      {loading ? <span className="spinner" aria-hidden /> : null}
      <span className="btn__text">{children}</span>
    </button>
  );
}
