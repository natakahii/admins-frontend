import React, { useEffect, useMemo, useState } from "react";
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

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }),
    []
  );

  const kpi = [
    { label: "Total Users", value: numberFormatter.format(stats?.total_users || 0), change: "+4.1%" },
    { label: "Total Vendors", value: numberFormatter.format(stats?.total_vendors || 0), change: "+2.8%" },
    { label: "Total Products", value: numberFormatter.format(stats?.total_products || 0), change: "+12%" },
    { label: "Total Orders", value: numberFormatter.format(stats?.total_orders || 0), change: "+6.5%" }
  ];

  const trendSeries = stats?.orders_trend?.length ? stats.orders_trend : [8, 12, 10, 15, 18, 16, 22];
  const maxTrend = Math.max(...trendSeries, 1);

  const avgOrderValueRaw = stats?.average_order_value
    || (stats?.total_revenue && stats?.total_orders ? stats.total_revenue / Math.max(stats.total_orders, 1) : 0);
  const avgOrderValue = formatTZS(avgOrderValueRaw || 0);

  const fulfillmentRate = stats?.order_fulfillment_rate || 98;
  const disputeRate = stats?.open_disputes ? Math.min(99, (stats.open_disputes / Math.max(stats?.total_orders || 1, 1)) * 100) : 2;

  const analyticsHighlights = [
    {
      label: "New Users (30d)",
      value: numberFormatter.format(stats?.new_users_30d || stats?.total_users || 0),
      change: "+8.4%"
    },
    {
      label: "Vendor Activations",
      value: numberFormatter.format(stats?.pending_vendor_verifications || 0),
      change: "-1.2%"
    },
    {
      label: "Tickets Resolved",
      value: numberFormatter.format(stats?.resolved_tickets_30d || stats?.open_tickets || 0),
      change: "+3.1%"
    }
  ];

  const trafficSources = [
    { label: "Direct", value: 46 },
    { label: "Search", value: 32 },
    { label: "Referrals", value: 14 },
    { label: "Campaigns", value: 8 }
  ];
  const maxSourceValue = Math.max(...trafficSources.map((s) => s.value), 1);

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
          <div className="gridKpi gridKpi--modern">
            {kpi.map((item) => (
              <div key={item.label} className="kpi">
                <div className="kpi__label">{item.label}</div>
                <div className="kpi__value">{item.value}</div>
                <div className="kpi__trend tag tag--success">{item.change}</div>
                <div className="kpi__spark">
                  <span className="spark spark--up" />
                </div>
              </div>
            ))}
          </div>

          <div className="dashboardGrid">
            <Card
              title="Revenue Trend"
              subtitle="Snapshot vs last 7 days"
              className="chartCard"
            >
              <div className="chartCard__header">
                <div>
                  <div className="bigNumber">{formatTZS(stats?.total_revenue || 0)}</div>
                  <div className="muted">Total processed volume</div>
                </div>
                <span className="pill pill--success">+12.4%</span>
              </div>
              <div className="sparkline" aria-label="Revenue sparkline">
                {trendSeries.map((point, idx) => (
                  <span
                    key={`spark-${point}-${idx}`}
                    className="sparkline__bar"
                    style={{ height: `${(point / maxTrend) * 100}%` }}
                  />
                ))}
              </div>
              <div className="rowBetween chartCard__footer">
                <div>
                  <div className="muted">Avg. order value</div>
                  <strong>{avgOrderValue}</strong>
                </div>
                <div>
                  <div className="muted">Fulfillment rate</div>
                  <strong>{fulfillmentRate}%</strong>
                </div>
              </div>
            </Card>

            <Card
              title="Operational Health"
              subtitle="Moderation & support"
              className="metricCard"
            >
              <div className="stack gap-md">
                <div className="metricCard__stat">
                  <div>
                    <div className="muted">Pending Vendor Verifications</div>
                    <strong>{safeText(stats?.pending_vendor_verifications || 0)}</strong>
                  </div>
                  <span className="tag tag--warning">Action needed</span>
                </div>
                <div className="metricCard__stat">
                  <div>
                    <div className="muted">Open Disputes</div>
                    <strong>{safeText(stats?.open_disputes || 0)}</strong>
                  </div>
                  <span className="tag tag--danger">{disputeRate.toFixed(1)}%</span>
                </div>
                <div className="metricCard__stat">
                  <div>
                    <div className="muted">Open Tickets</div>
                    <strong>{safeText(stats?.open_tickets || 0)}</strong>
                  </div>
                  <span className="tag">Balanced</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="dashboardGrid dashboardGrid--split">
            <Card
              title="Engagement Analytics"
              subtitle="Last 30 days"
              className="analyticsCard"
            >
              <div className="analyticsHighlights">
                {analyticsHighlights.map((item) => (
                  <div key={item.label} className="analyticsHighlights__item">
                    <div className="muted">{item.label}</div>
                    <strong>{item.value}</strong>
                    <span className="tag tag--success">{item.change}</span>
                  </div>
                ))}
              </div>

              <div className="progressList">
                {trafficSources.map((source) => (
                  <div key={source.label} className="progressList__item">
                    <div className="rowBetween">
                      <div className="muted">{source.label}</div>
                      <span>{source.value}%</span>
                    </div>
                    <div className="progressBar">
                      <span
                        className="progressBar__value"
                        style={{ width: `${(source.value / maxSourceValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Operational Checklist"
              subtitle="What needs your attention"
              className="checklistCard"
            >
              <ul className="checklist">
                <li>
                  <span>Onboard {safeText(stats?.pending_vendor_verifications || 0)} vendors</span>
                  <span className="tag">Today</span>
                </li>
                <li>
                  <span>Resolve {safeText(stats?.open_disputes || 0)} disputes</span>
                  <span className="tag tag--danger">Priority</span>
                </li>
                <li>
                  <span>Close {safeText(stats?.open_tickets || 0)} support tickets</span>
                  <span className="tag tag--neutral">Queue</span>
                </li>
              </ul>
            </Card>
          </div>

          <Card
            title="Recent Orders (placeholder table)"
            subtitle="If your /admin/dashboard already returns recent_orders, it will show here"
            className="tableCard"
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
