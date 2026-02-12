import React, { useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { adminApi } from "../api/admin.api.js";

export default function RefundsPage() {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function submit() {
    setSaving(true);
    try {
      await adminApi.createRefund({
        order_id: Number(orderId),
        amount: Number(amount),
        reason,
        notes
      });
      setToast({ open: true, tone: "success", message: "Refund initiated successfully." });
      setOrderId("");
      setAmount("");
      setReason("");
      setNotes("");
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to initiate refund." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Refunds" subtitle="Create refunds under policy rules" />

      <Card title="Create Refund" subtitle="Admin: POST /api/v1/admin/refunds">
        <div className="grid2">
          <Input label="Order ID" placeholder="e.g. 900" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <Input label="Amount" placeholder="e.g. 50000" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Reason" placeholder="Short reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
          <Input label="Notes (optional)" placeholder="More details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="rowEnd" style={{ marginTop: 12 }}>
          <Button onClick={submit} loading={saving}>Submit Refund</Button>
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          Tip: backend must validate eligibility (paid, within window, etc).
        </div>
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
