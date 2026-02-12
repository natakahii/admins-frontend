import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { adminApi } from "../api/admin.api.js";
import { safeText } from "../../../utils/formatters.js";

export default function ProductsPage() {
  const [status, setStatus] = useState("");
  const [reported, setReported] = useState("");
  const [vendorId, setVendorId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (reported) p.reported = reported;
    if (vendorId) p.vendor_id = vendorId;
    return p;
  }, [status, reported, vendorId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/products",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  function openModeration(row) {
    setSelected(row);
    setNewStatus(row?.status || "active");
    setNotes("");
    setOpen(true);
  }

  async function saveModeration() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.moderateProduct(selected.id, { status: newStatus, notes });
      setToast({ open: true, tone: "success", message: "Product moderation updated." });
      setOpen(false);
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to moderate product." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Products"
        subtitle="Moderation and visibility control"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card title="Filters" subtitle="Moderation filters">
        <div className="grid3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">active</option>
            <option value="hidden">hidden</option>
            <option value="flagged">flagged</option>
            <option value="draft">draft</option>
          </Select>
          <Select label="Reported" value={reported} onChange={(e) => setReported(e.target.value)}>
            <option value="">All</option>
            <option value="1">reported</option>
            <option value="0">not reported</option>
          </Select>
          <Input label="Vendor ID" placeholder="e.g. 8" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
        </div>
      </Card>

      <Card title="Products List" subtitle="Admin: GET /api/v1/admin/products">
        {loading ? <Loader label="Loading products..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "name", header: "Product", width: "320px", render: (r) => safeText(r.name) },
            { key: "vendor_id", header: "Vendor", width: "120px" },
            {
              key: "status",
              header: "Status",
              width: "140px",
              render: (r) => {
                const s = r.status;
                const tone = s === "active" ? "success" : s === "hidden" ? "warning" : "danger";
                return <Badge tone={tone}>{safeText(s)}</Badge>;
              }
            },
            {
              key: "actions",
              header: "Action",
              width: "160px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => openModeration(r)}>
                  Moderate
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No products found."
        />
      </Card>

      <Modal
        open={open}
        title={`Moderate Product — ${selected?.name || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveModeration} loading={saving}>Save</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="New status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="hidden">hidden</option>
            <option value="flagged">flagged</option>
          </Select>
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason / notes..." />
        </div>
      </Modal>

      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
