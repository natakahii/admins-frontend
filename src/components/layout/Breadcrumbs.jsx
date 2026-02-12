import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Breadcrumbs
 * - Auto-generates crumbs from the current URL (pathname)
 * - Or you can pass `items` manually for nicer labels on dynamic routes (IDs)
 *
 * Props:
 * - items?: Array<{ label: string, to?: string }>
 * - homeLabel?: string
 * - homeHref?: string
 * - hideHome?: boolean
 * - labelMap?: Record<string, string> (maps path segment -> nicer label)
 * - formatLabel?: (segment: string) => string
 * - className?: string
 * - style?: React.CSSProperties
 */
function titleCase(str = "") {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function isProbablyId(seg) {
  // hide/format numeric or UUID-like segments
  if (!seg) return false;
  const isNumeric = /^\d+$/.test(seg);
  const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg);
  return isNumeric || isUuidLike;
}

export default function Breadcrumbs({
  items,
  homeLabel = "Dashboard",
  homeHref = "/admin/dashboard",
  hideHome = false,
  labelMap = {},
  formatLabel,
  className = "",
  style,
}) {
  const { pathname } = useLocation();

  const crumbs = useMemo(() => {
    // If items provided, use them as-is (best for pages like "/admin/orders/123")
    if (Array.isArray(items) && items.length > 0) {
      // Optionally prepend Home
      const base = hideHome ? [] : [{ label: homeLabel, to: homeHref }];
      return [...base, ...items];
    }

    // Auto build from pathname
    const segments = pathname.split("/").filter(Boolean);

    // Build incremental hrefs: /a, /a/b, /a/b/c
    const generated = segments
      .filter((seg) => !isProbablyId(seg))
      .reduce((list, seg) => {
        const nextTo = `${list.length ? list[list.length - 1].to : ""}/${seg}`;
        const mapped = labelMap[seg];
        const label = mapped || (formatLabel ? formatLabel(seg) : titleCase(seg));
        list.push({ label, to: nextTo });
        return list;
      }, []);

    if (hideHome) return generated;

    // If current location already starts with homeHref, keep Home but avoid duplicates
    const base = { label: homeLabel, to: homeHref };
    const all = [base, ...generated];

    // Remove duplicates like "Admin" repeating, etc.
    const unique = [];
    const seen = new Set();
    for (const c of all) {
      const key = `${c.label}|${c.to || ""}`;
      if (!seen.has(key)) {
        unique.push(c);
        seen.add(key);
      }
    }
    return unique;
  }, [items, pathname, hideHome, homeLabel, homeHref, labelMap, formatLabel]);

  // If only "Home" exists, you may hide to keep header clean
  if (!crumbs || crumbs.length <= 1) return null;

  const s = {
    nav: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      minHeight: 28,
      fontSize: 13,
      color: "#5B6574",
      ...style,
    },
    ol: { display: "flex", alignItems: "center", gap: 8, listStyle: "none", padding: 0, margin: 0 },
    sep: { color: "#A7B0BE", userSelect: "none" },
    link: {
      color: "#142490",
      textDecoration: "none",
      fontWeight: 500,
      lineHeight: "18px",
    },
    current: {
      color: "#111827",
      fontWeight: 600,
      lineHeight: "18px",
    },
    item: { display: "flex", alignItems: "center", gap: 8 },
  };

  return (
    <nav aria-label="Breadcrumb" className={className} style={s.nav}>
      <ol style={s.ol}>
        {crumbs.map((c, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={`${c.label}-${idx}`} style={s.item}>
              {isLast || !c.to ? (
                <span style={s.current} aria-current="page">
                  {c.label}
                </span>
              ) : (
                <Link
                  to={c.to}
                  style={s.link}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {c.label}
                </Link>
              )}

              {!isLast && <span style={s.sep}>›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
