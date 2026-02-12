import React, { useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { superApi } from "../api/super.api.js";

export default function SubscriptionPlansPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [features, setFeatures] = useState(""); // comma separated
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function save() {
    setSaving(true);
    try {
      const featuresArr = features
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      await superApi.saveSubscriptionPlan({
        name,
        price: Number(price),
        duration_days: Number(durationDays),
        features: featuresArr,
        is_active: true
      });

      setToast({ open: true, tone: "success", message: "Subscription plan saved." });
      setName(""); setPrice(""); setDurationDays(""); setFeatures("");
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to save plan." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Subscription Plans" subtitle="Create/update vendor subscription plans" />

      <Card title="Create Plan" subtitle="Super: POST /api/v1/admin/super/subscription-plans">
        <div className="grid2">
          <Input label="Name" placeholder="e.g. Pro Vendor" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Price" placeholder="e.g. 20000" value={price} onChange={(e) => setPrice(e.target.value)} />
          <Input label="Duration (days)" placeholder="e.g. 30" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
          <Input label="Features (comma separated)" placeholder="priority support, boosted listings" value={features} onChange={(e) => setFeatures(e.target.value)} />
        </div>

        <div className="rowEnd" style={{ marginTop: 12 }}>
          <Button onClick={save} loading={saving}>Save Plan</Button>
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          Note: listing endpoint is not in your route file; add one later for full CRUD UI.
        </div>
      </Card>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
