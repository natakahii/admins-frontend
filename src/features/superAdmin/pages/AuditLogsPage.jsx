import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { safeText } from "../../../utils/formatters.js";

export default function AuditLogsPage() {
  const [actorUserId, setActorUserId] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (actorUserId) p.actor_user_id = actorUserId;
    if (action) p.action = action;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [actorUserId, action, from, to]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/super/audit-logs",
    params
  });

  return (
    <div className="stack gap-lg">
      <PageHeader title="Audit Logs" subtitle="Security & compliance actions history" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Actor, action, date range">
        <div className="grid3">
          <Input label="Actor user ID" placeholder="e.g. 12" value={actorUserId} onChange={(e) => setActorUserId(e.target.value)} />
          <Input label="Action" placeholder="vendor_verification_approved..." value={action} onChange={(e) => setAction(e.target.value)} />
          <Input label="From (YYYY-MM-DD)" placeholder="2026-02-01" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="To (YYYY-MM-DD)" placeholder="2026-02-09" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </Card>

      <Card title="Audit Logs" subtitle="Super: GET /api/v1/admin/super/audit-logs">
        {loading ? <Loader label="Loading audit logs..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "action", header: "Action", width: "260px", render: (r) => safeText(r.action) },
            { key: "actor_user_id", header: "Actor", width: "130px", render: (r) => safeText(r.actor_user_id) },
            { key: "created_at", header: "Time", render: (r) => safeText(r.created_at) }
          ]}
          rows={data}
          emptyText="No audit logs found."
        />
      </Card>
    </div>
  );
}
