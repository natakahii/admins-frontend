import React, { useEffect, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Table from "../../../components/ui/Table.jsx";
import { adminApi } from "../api/admin.api.js";
import { formatTZS, safeText } from "../../../utils/formatters.js";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.dashboard();
      setStats(res?.data || res);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load dashboard.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const kpi = [
    { label: "Total Users", value: safeText(stats?.total_users) },
    { label: "Total Vendors", value: safeText(stats?.total_vendors) },
    { label: "Total Products", value: safeText(stats?.total_products) },
    { label: "Total Orders", value: safeText(stats?.total_orders) }
  ];

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Dashboard"
        subtitle="Quick overview of platform activity"
        right={<Badge tone="primary">Live</Badge>}
      />

      {loading ? <Loader label="Loading dashboard..." /> : null}
      {error ? <div className="alert alert--danger">{error}</div> : null}

      {!loading && !error ? (
        <>
          <div className="gridKpi">
            {kpi.map((x) => (
              <div key={x.label} className="kpi">
                <div className="kpi__label">{x.label}</div>
                <div className="kpi__value">{x.value}</div>
              </div>
            ))}
          </div>

          <div className="grid2">
            <Card
              title="Revenue (Snapshot)"
              subtitle="Based on available backend stats"
            >
              <div className="bigNumber">{formatTZS(stats?.total_revenue || 0)}</div>
              <div className="muted">Tip: connect this to your analytics endpoint for trends.</div>
            </Card>

            <Card
              title="Operational Health"
              subtitle="Moderation & support"
            >
              <div className="stack">
                <div className="rowBetween">
                  <span className="muted">Pending Vendor Verifications</span>
                  <strong>{safeText(stats?.pending_vendor_verifications || 0)}</strong>
                </div>
                <div className="rowBetween">
                  <span className="muted">Open Disputes</span>
                  <strong>{safeText(stats?.open_disputes || 0)}</strong>
                </div>
                <div className="rowBetween">
                  <span className="muted">Open Tickets</span>
                  <strong>{safeText(stats?.open_tickets || 0)}</strong>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Recent Orders (placeholder table)"
            subtitle="If your /admin/dashboard already returns recent_orders, it will show here"
          >
            <Table
              columns={[
                { key: "id", header: "Order ID", width: "120px" },
                { key: "status", header: "Status", width: "140px" },
                { key: "grand_total", header: "Total", render: (r) => formatTZS(r.grand_total) }
              ]}
              rows={stats?.recent_orders || []}
              emptyText="No recent orders in payload. (Optional: load /api/v1/admin/orders?sort=newest)"
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}
