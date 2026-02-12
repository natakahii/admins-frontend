import React from "react";

export default function Card({ title, subtitle, actions, children }) {
  return (
    <div className="card">
      {(title || subtitle || actions) ? (
        <div className="card__header">
          <div>
            {title ? <div className="card__title">{title}</div> : null}
            {subtitle ? <div className="card__subtitle">{subtitle}</div> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="card__body">{children}</div>
    </div>
  );
}
