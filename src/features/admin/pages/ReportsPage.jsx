import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { adminApi } from "../api/admin.api.js";
import { safeText } from "../../../utils/formatters.js";

export default function ReportsPage() {
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (type) p.type = type;
    return p;
  }, [status, type]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/reports",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("dismiss");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  function openAction(row) {
    setSelected(row);
    setAction("dismiss");
    setNotes("");
    setOpen(true);
  }

  async function submitAction() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.actionReport(selected.id, { action, notes });
      setToast({ open: true, tone: "success", message: "Report actioned successfully." });
      setOpen(false);
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to action report." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Reports" subtitle="Moderation queue and actions" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Filter reports queue">
        <div className="grid3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="open">open</option>
            <option value="reviewed">reviewed</option>
            <option value="actioned">actioned</option>
            <option value="rejected">rejected</option>
          </Select>
          <Input label="Type (optional)" placeholder="product, vendor, user..." value={type} onChange={(e) => setType(e.target.value)} />
          <Input label="Hint" value="Use backend fields available" readOnly />
        </div>
      </Card>

      <Card title="Reports List" subtitle="Admin: GET /api/v1/admin/reports">
        {loading ? <Loader label="Loading reports..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "status", header: "Status", width: "140px", render: (r) => safeText(r.status) },
            { key: "reason", header: "Reason", width: "200px", render: (r) => safeText(r.reason) },
            { key: "type", header: "Type", width: "160px", render: (r) => safeText(r.type) },
            {
              key: "actions",
              header: "Action",
              width: "160px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => openAction(r)}>
                  Take Action
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No reports found."
        />
      </Card>

      <Modal
        open={open}
        title={`Action Report — #${selected?.id || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitAction} loading={saving}>Submit</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="dismiss">dismiss</option>
            <option value="hide">hide</option>
            <option value="block_user">block_user</option>
            <option value="block_vendor">block_vendor</option>
            <option value="request_more_info">request_more_info</option>
          </Select>
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." />
        </div>
      </Modal>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
