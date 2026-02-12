import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { adminApi } from "../api/admin.api.js";
import { safeText } from "../../../utils/formatters.js";

export default function AnalyticsOverviewPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [from, to]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.analyticsOverview(params);
      setData(res?.data || res);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Analytics" subtitle="Platform analytics overview" />

      <Card title="Filters" subtitle="Optional date range">
        <div className="grid3">
          <Input label="From (YYYY-MM-DD)" placeholder="2026-02-01" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To (YYYY-MM-DD)" placeholder="2026-02-09" value={to} onChange={(e) => setTo(e.target.value)} />
          <div style={{ alignSelf: "end" }}>
            <Button onClick={load} loading={loading}>Load</Button>
          </div>
        </div>
      </Card>

      {loading ? <Loader label="Loading analytics..." /> : null}
      {error ? <div className="alert alert--danger">{error}</div> : null}

      {data ? (
        <div className="gridKpi">
          <div className="kpi"><div className="kpi__label">Total Users</div><div className="kpi__value">{safeText(data.total_users)}</div></div>
          <div className="kpi"><div className="kpi__label">Total Vendors</div><div className="kpi__value">{safeText(data.total_vendors)}</div></div>
          <div className="kpi"><div className="kpi__label">Total Orders</div><div className="kpi__value">{safeText(data.total_orders)}</div></div>
          <div className="kpi"><div className="kpi__label">Total Revenue</div><div className="kpi__value">{safeText(data.total_revenue)}</div></div>
        </div>
      ) : (
        <Card title="No analytics loaded" subtitle="Click Load to fetch from backend">
          <div className="muted">Endpoint: GET /api/v1/admin/analytics/overview</div>
        </Card>
      )}
    </div>
  );
}
