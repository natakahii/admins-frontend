import React from "react";

export default function PageHeader({ title, subtitle, right }) {
  return (
    <div className="pageHeader">
      <div>
        <div className="pageHeader__title">{title}</div>
        {subtitle ? <div className="pageHeader__subtitle">{subtitle}</div> : null}
      </div>
      {right ? <div className="pageHeader__right">{right}</div> : null}
    </div>
  );
}
