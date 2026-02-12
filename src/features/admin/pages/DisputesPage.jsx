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

export default function DisputesPage() {
  const [status, setStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [orderId, setOrderId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (vendorId) p.vendor_id = vendorId;
    if (orderId) p.order_id = orderId;
    return p;
  }, [status, vendorId, orderId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/disputes",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState("release_to_vendor");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  function openResolve(row) {
    setSelected(row);
    setResolution("release_to_vendor");
    setAmount("");
    setNotes("");
    setOpen(true);
  }

  async function submitResolve() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.resolveDispute(selected.id, {
        resolution,
        amount: amount ? Number(amount) : undefined,
        notes
      });
      setToast({ open: true, tone: "success", message: "Dispute resolved." });
      setOpen(false);
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to resolve dispute." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Disputes" subtitle="Review and resolve disputes" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Narrow disputes">
        <div className="grid3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="open">open</option>
            <option value="under_review">under_review</option>
            <option value="resolved">resolved</option>
            <option value="rejected">rejected</option>
          </Select>
          <Input label="Vendor ID" placeholder="e.g. 8" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
          <Input label="Order ID" placeholder="e.g. 900" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </div>
      </Card>

      <Card title="Disputes List" subtitle="Admin: GET /api/v1/admin/disputes">
        {loading ? <Loader label="Loading disputes..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "status", header: "Status", width: "160px", render: (r) => safeText(r.status) },
            { key: "order_id", header: "Order", width: "120px" },
            { key: "vendor_id", header: "Vendor", width: "120px" },
            {
              key: "actions",
              header: "Action",
              width: "160px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => openResolve(r)}>
                  Resolve
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No disputes found."
        />
      </Card>

      <Modal
        open={open}
        title={`Resolve Dispute — #${selected?.id || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitResolve} loading={saving}>Submit</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="Resolution" value={resolution} onChange={(e) => setResolution(e.target.value)}>
            <option value="release_to_vendor">release_to_vendor</option>
            <option value="refund_customer">refund_customer</option>
            <option value="partial_split">partial_split</option>
            <option value="cancel_order">cancel_order</option>
            <option value="other">other</option>
          </Select>
          <Input label="Amount (only for partial_split)" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 20000" />
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write notes..." />
        </div>
      </Modal>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
