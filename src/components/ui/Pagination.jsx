import React, { useMemo } from "react";
import Button from "./Button.jsx";

/**
 * Pagination (UI)
 *
 * Props:
 * - page: number (1-based)
 * - pageSize: number
 * - total: number (total items)
 * - onPageChange: (nextPage:number) => void
 * - onPageSizeChange?: (nextSize:number) => void
 * - pageSizeOptions?: number[] (default [10, 20, 50, 100])
 * - showPageSize?: boolean (default true)
 * - compact?: boolean (default false)
 */
export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSize = true,
  compact = false
}) {
  const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / (Number(pageSize) || 10)));

  const safePage = clamp(page, 1, totalPages);

  const range = useMemo(() => {
    const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, total);
    return { start, end };
  }, [safePage, pageSize, total]);

  const pages = useMemo(() => {
    return buildPages(safePage, totalPages);
  }, [safePage, totalPages]);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const go = (p) => {
    const next = clamp(p, 1, totalPages);
    if (next !== safePage) onPageChange?.(next);
  };

  return (
    <div className={`nhPagination ${compact ? "nhPagination--compact" : ""}`}>
      <div className="nhPagination__left">
        <div className="nhPagination__meta">
          {total === 0 ? (
            <span>No results</span>
          ) : (
            <span>
              Showing <b>{range.start}</b>–<b>{range.end}</b> of <b>{total}</b>
            </span>
          )}
        </div>

        {showPageSize && onPageSizeChange ? (
          <div className="nhPagination__pageSize">
            <label className="nhPagination__label">Rows</label>
            <select
              className="nhPagination__select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="nhPagination__right" role="navigation" aria-label="Pagination">
        <Button
          variant="secondary"
          onClick={() => go(safePage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          Prev
        </Button>

        <div className="nhPagination__pages" aria-label="Page numbers">
          {pages.map((item, idx) => {
            if (item === "…") {
              return (
                <span key={`dots-${idx}`} className="nhPagination__dots" aria-hidden>
                  …
                </span>
              );
            }

            const isActive = item === safePage;
            return (
              <button
                key={item}
                type="button"
                className={`nhPagination__page ${isActive ? "is-active" : ""}`}
                onClick={() => go(item)}
                aria-current={isActive ? "page" : undefined}
              >
                {item}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          onClick={() => go(safePage + 1)}
          disabled={!canNext}
          aria-label="Next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/** ---------- helpers ---------- */

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

/**
 * Builds a compact page list with ellipsis.
 * Examples:
 * - totalPages <= 7: 1 2 3 4 5 6 7
 * - large: 1 2 … 7 8 9 … 19 20
 */
function buildPages(current, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const out = [];
  const left = Math.max(1, current - 1);
  const right = Math.min(totalPages, current + 1);

  // always include first two
  out.push(1, 2);

  // left ellipsis
  if (left > 4) out.push("…");
  else {
    for (let p = 3; p < left; p++) out.push(p);
  }

  // middle (current neighborhood)
  for (let p = left; p <= right; p++) {
    if (!out.includes(p) && p > 2 && p < totalPages - 1) out.push(p);
  }

  // right ellipsis
  if (right < totalPages - 3) out.push("…");
  else {
    for (let p = right + 1; p <= totalPages - 2; p++) {
      if (p > 2) out.push(p);
    }
  }

  // always include last two
  out.push(totalPages - 1, totalPages);

  // remove duplicates and keep order
  return out.filter((v, i) => out.indexOf(v) === i).filter((v) => v >= 1 && v <= totalPages);
}
