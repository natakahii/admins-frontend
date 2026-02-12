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

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const [vendorType, setVendorType] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (vendorType) p.vendor_type = vendorType;
    if (verificationStatus) p.verification_status = verificationStatus;
    return p;
  }, [search, vendorType, verificationStatus]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/vendors",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState("approved");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  function openReview(row) {
    setSelected(row);
    setDecision("approved");
    setNotes("");
    setOpen(true);
  }

  async function submitReview() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.reviewVendorVerification(selected.id, {
        status: decision,
        review_notes: notes
      });
      setToast({ open: true, tone: "success", message: "Vendor verification updated." });
      setOpen(false);
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to review vendor." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Vendors"
        subtitle="Verification and vendor oversight"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card title="Filters" subtitle="Search and filter vendor list">
        <div className="grid3">
          <Input label="Search" placeholder="Vendor name or slug..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Vendor type" value={vendorType} onChange={(e) => setVendorType(e.target.value)}>
            <option value="">All</option>
            <option value="individual_vendor">individual_vendor</option>
            <option value="business_vendor">business_vendor</option>
          </Select>
          <Select label="Verification status" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </Select>
        </div>
      </Card>

      <Card title="Vendors List" subtitle="Admin: GET /api/v1/admin/vendors">
        {loading ? <Loader label="Loading vendors..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "name", header: "Vendor", width: "260px", render: (r) => safeText(r.name) },
            { key: "slug", header: "Slug", width: "200px" },
            {
              key: "verification_status",
              header: "Verification",
              width: "160px",
              render: (r) => {
                const v = r.verification_status;
                const tone = v === "approved" ? "success" : v === "pending" ? "warning" : "danger";
                return <Badge tone={tone}>{safeText(v)}</Badge>;
              }
            },
            {
              key: "actions",
              header: "Action",
              width: "160px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => openReview(r)}>
                  Review
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No vendors found."
        />
      </Card>

      <Modal
        open={open}
        title={`Review Vendor — ${selected?.name || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} loading={saving}>Submit</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="Decision" value={decision} onChange={(e) => setDecision(e.target.value)}>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </Select>
          <Input label="Review notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Write a short note..." />
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
