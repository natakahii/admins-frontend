import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { safeText } from "../../../utils/formatters.js";

export default function SupportTicketsPage() {
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (priority) p.priority = priority;
    return p;
  }, [status, priority]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/support/tickets",
    params
  });

  return (
    <div className="stack gap-lg">
      <PageHeader title="Support Tickets" subtitle="Customer & vendor support queue" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Status and priority">
        <div className="grid3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="open">open</option>
            <option value="pending">pending</option>
            <option value="closed">closed</option>
          </Select>
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All</option>
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
          </Select>
          <Input label="Tip" value="Use backend filters as needed" readOnly />
        </div>
      </Card>

      <Card title="Tickets" subtitle="Admin: GET /api/v1/admin/support/tickets">
        {loading ? <Loader label="Loading tickets..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "status", header: "Status", width: "140px", render: (r) => safeText(r.status) },
            { key: "priority", header: "Priority", width: "140px", render: (r) => safeText(r.priority) },
            { key: "subject", header: "Subject", render: (r) => safeText(r.subject) }
          ]}
          rows={data}
          emptyText="No tickets found."
        />
      </Card>
    </div>
  );
}
