import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "./icons/Icon.jsx";

export default function Sidebar({ nav = [], open = false, onClose, onNavigate }) {
  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar__top">
        <div className="brand">
          <div className="brand__mark">N</div>
          <div className="brand__text">
            <div className="brand__name">NatakaHii</div>
            <div className="brand__sub">Admin Console</div>
          </div>
        </div>

        <button type="button" className="sidebar__close" onClick={onClose} aria-label="Close navigation">
          <Icon name="x" />
        </button>
      </div>

      <nav className="nav">
        {nav.map((item) => {
          if (item.icon === "divider") {
            return <div key={item.label} className="nav__divider">{item.label}</div>;
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}
              onClick={onNavigate}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <div className="muted">© {new Date().getFullYear()} NatakaHii</div>
      </div>
    </aside>
  );
}
