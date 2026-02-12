import React, { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { adminApi } from "../api/admin.api.js";
import { safeText } from "../../../utils/formatters.js";

export default function ShipmentsPage() {
  const [status, setStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [deliveryAgentId, setDeliveryAgentId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (vendorId) p.vendor_id = vendorId;
    if (deliveryAgentId) p.delivery_agent_id = deliveryAgentId;
    return p;
  }, [status, vendorId, deliveryAgentId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/shipments",
    params
  });

  const [open, setOpen] = useState(false);
  const [inspections, setInspections] = useState([]);
  const [insLoading, setInsLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function viewInspections(shipmentId) {
    setOpen(true);
    setInsLoading(true);
    setInspections([]);
    try {
      const res = await adminApi.shipmentInspections(shipmentId);
      const list = res?.data || res;
      setInspections(Array.isArray(list) ? list : []);
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to load inspections." });
    } finally {
      setInsLoading(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Shipments" subtitle="Track delivery flow and inspections" right={<Button variant="secondary" onClick={reload}>Refresh</Button>} />

      <Card title="Filters" subtitle="Shipment filters">
        <div className="grid3">
          <Input label="Status" placeholder="in_transit, delivered..." value={status} onChange={(e) => setStatus(e.target.value)} />
          <Input label="Vendor ID" placeholder="e.g. 8" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
          <Input label="Delivery agent ID" placeholder="e.g. 12" value={deliveryAgentId} onChange={(e) => setDeliveryAgentId(e.target.value)} />
        </div>
      </Card>

      <Card title="Shipments List" subtitle="Admin: GET /api/v1/admin/shipments">
        {loading ? <Loader label="Loading shipments..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "tracking_number", header: "Tracking", width: "200px", render: (r) => safeText(r.tracking_number) },
            { key: "status", header: "Status", width: "160px", render: (r) => safeText(r.status) },
            {
              key: "actions",
              header: "Inspections",
              width: "170px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => viewInspections(r.id)}>
                  View
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No shipments found."
        />
      </Card>

      <Modal
        open={open}
        title="Shipment Inspections"
        onClose={() => setOpen(false)}
      >
        {insLoading ? <Loader label="Loading inspections..." /> : null}
        {!insLoading ? (
          <Table
            columns={[
              { key: "stage", header: "Stage", width: "200px" },
              { key: "status", header: "Status", width: "160px" },
              { key: "notes", header: "Notes" }
            ]}
            rows={inspections}
            emptyText="No inspection records."
          />
        ) : null}
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
