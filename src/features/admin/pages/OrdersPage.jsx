import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { formatTZS, safeText } from "../../../utils/formatters.js";

export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [vendorId, setVendorId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (paymentStatus) p.payment_status = paymentStatus;
    if (vendorId) p.vendor_id = vendorId;
    return p;
  }, [status, paymentStatus, vendorId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/orders",
    params
  });

  return (
    <div className="stack gap-lg">
      <PageHeader title="Orders" subtitle="Monitor all orders" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Basic filters">
        <div className="grid3">
          <Input label="Status" placeholder="paid, pending, shipped..." value={status} onChange={(e) => setStatus(e.target.value)} />
          <Input label="Payment status" placeholder="initiated, paid..." value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} />
          <Input label="Vendor ID" placeholder="e.g. 8" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
        </div>
      </Card>

      <Card title="Orders List" subtitle="Admin: GET /api/v1/admin/orders">
        {loading ? <Loader label="Loading orders..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "status", header: "Status", width: "140px", render: (r) => safeText(r.status) },
            { key: "payment_status", header: "Payment", width: "160px", render: (r) => safeText(r.payment_status) },
            { key: "grand_total", header: "Total", render: (r) => formatTZS(r.grand_total) }
          ]}
          rows={data}
          emptyText="No orders found."
        />
      </Card>
    </div>
  );
}
