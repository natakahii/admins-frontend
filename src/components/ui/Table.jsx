import React from "react";

export default function Table({ columns = [], rows = [], rowKey = "id", emptyText = "No data found." }) {
  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width || "auto" }}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">{emptyText}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row?.[rowKey] ?? JSON.stringify(row)}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row) : (row?.[c.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
