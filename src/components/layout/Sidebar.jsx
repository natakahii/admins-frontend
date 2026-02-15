import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import Icon from "./icons/Icon.jsx";
import logoImg from "../../assets/logo/logo.png";

function CategoryChildren({ items = [] }) {
  if (!Array.isArray(items) || !items.length) return null;
  return (
    <ul className="categoryList categoryList--children">
      {items.map((child) => (
        <li key={child.id || child.slug || child.name}>
          <div className="categoryList__item">
            <span className="categoryList__name">{child.name}</span>
            {child.products_count ? <span className="categoryList__count">{child.products_count}</span> : null}
          </div>
          <CategoryChildren items={child.children} />
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar({
  nav = [],
  open = false,
  onClose,
  onNavigate,
  categories = [],
  categoriesLoading = false,
  categoriesError = ""
}) {
  const topCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.slice(0, 6);
  }, [categories]);

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="sidebar__top">
        <div className="brand">
          <div className="brand__mark">
            <img src={logoImg} alt="NatakaHii" className="brand__logo" />
          </div>
          <div className="brand__text">
            <div className="brand__name">natakahii</div>
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

      <div className="sidebar__section">
        <div className="sidebar__sectionHeader">
          <span>Categories</span>
          {categoriesLoading ? <span className="sidebar__sectionPill">Syncing…</span> : null}
        </div>
        {categoriesError ? <div className="sidebar__error">{categoriesError}</div> : null}
        {!categoriesLoading && !categoriesError ? (
          <ul className="categoryList">
            {topCategories.map((cat) => (
              <li key={cat.id || cat.slug || cat.name}>
                <div className="categoryList__item">
                  <span className="categoryList__name">{cat.name}</span>
                  {cat.products_count ? (
                    <span className="categoryList__count">{cat.products_count}</span>
                  ) : null}
                </div>
                <CategoryChildren items={cat.children} />
              </li>
            ))}
            {!topCategories.length ? <li className="muted">No categories</li> : null}
          </ul>
        ) : null}
        <div className="sidebar__help">Fetched from /api/v1/categories</div>
      </div>

      <div className="sidebar__footer">
        <div className="muted">© {new Date().getFullYear()} natakahii</div>
      </div>
    </aside>
  );
}
