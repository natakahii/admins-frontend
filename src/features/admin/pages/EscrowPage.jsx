import React, { useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import Table from "../../../components/ui/Table.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { adminApi } from "../api/admin.api.js";
import { formatTZS, safeText } from "../../../utils/formatters.js";

export default function EscrowPage() {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [holds, setHolds] = useState(null);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function fetchEscrow() {
    if (!orderId.trim()) {
      setToast({ open: true, tone: "warning", message: "Enter an order ID first." });
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.escrowByOrder(orderId.trim());
      setHolds(res?.holds || res?.data?.holds || res?.data || res);
    } catch (e) {
      setHolds(null);
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to load escrow holds." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Escrow" subtitle="View escrow holds by order" />

      <Card title="Find Escrow Holds" subtitle="Admin: GET /api/v1/admin/escrow/orders/{order}">
        <div className="row gap-md">
          <div style={{ flex: 1 }}>
            <Input label="Order ID" placeholder="e.g. 900" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <div style={{ alignSelf: "end" }}>
            <Button onClick={fetchEscrow} loading={loading}>Fetch</Button>
          </div>
        </div>

        {loading ? <Loader label="Loading escrow..." /> : null}

        {holds ? (
          <div style={{ marginTop: 14 }}>
            <Table
              columns={[
                { key: "vendor_id", header: "Vendor", width: "120px" },
                { key: "status", header: "Status", width: "160px", render: (r) => safeText(r.status) },
                { key: "amount", header: "Amount", render: (r) => formatTZS(r.amount) }
              ]}
              rows={Array.isArray(holds) ? holds : (holds?.holds || [])}
              emptyText="No holds found for this order."
            />
          </div>
        ) : (
          <div className="muted" style={{ marginTop: 12 }}>Enter an order ID and click Fetch.</div>
        )}
      </Card>

      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
