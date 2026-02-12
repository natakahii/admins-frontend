import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { safeText } from "../../../utils/formatters.js";

export default function PaymentsPage() {
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const [orderId, setOrderId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (provider) p.provider = provider;
    if (status) p.status = status;
    if (orderId) p.order_id = orderId;
    return p;
  }, [provider, status, orderId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/payments",
    params
  });

  return (
    <div className="stack gap-lg">
      <PageHeader title="Payments" subtitle="Monitor payment activity" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Provider, status, order">
        <div className="grid3">
          <Input label="Provider" placeholder="mpesa, tigo, airtel, card..." value={provider} onChange={(e) => setProvider(e.target.value)} />
          <Input label="Status" placeholder="initiated, paid, failed..." value={status} onChange={(e) => setStatus(e.target.value)} />
          <Input label="Order ID" placeholder="e.g. 900" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </div>
      </Card>

      <Card title="Payments List" subtitle="Admin: GET /api/v1/admin/payments">
        {loading ? <Loader label="Loading payments..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "provider", header: "Provider", width: "150px", render: (r) => safeText(r.provider) },
            { key: "status", header: "Status", width: "150px", render: (r) => safeText(r.status) },
            { key: "order_id", header: "Order", width: "120px" }
          ]}
          rows={data}
          emptyText="No payments found."
        />
      </Card>
    </div>
  );
}
