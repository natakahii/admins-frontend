export function formatTZS(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(n) + " TZS";
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function safeText(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}
