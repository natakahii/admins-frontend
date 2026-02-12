import React, { useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Button from "../../../components/ui/Button.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { superApi } from "../api/super.api.js";

export default function PlatformFeesPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("percentage");
  const [value, setValue] = useState("");
  const [appliesTo, setAppliesTo] = useState("order");
  const [isActive, setIsActive] = useState("1");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function save() {
    setSaving(true);
    try {
      await superApi.savePlatformFee({
        name,
        type,
        value: Number(value),
        applies_to: appliesTo,
        is_active: isActive === "1"
      });
      setToast({ open: true, tone: "success", message: "Platform fee rule saved." });
      setName(""); setValue(""); setType("percentage"); setAppliesTo("order"); setIsActive("1");
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to save fee rule." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader title="Platform Fees" subtitle="Create/update commission rules" />

      <Card title="Create Fee Rule" subtitle="Super: POST /api/v1/admin/super/platform-fees">
        <div className="grid2">
          <Input label="Name" placeholder="e.g. Standard Commission" value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="percentage">percentage</option>
            <option value="fixed">fixed</option>
          </Select>
          <Input label="Value" placeholder="e.g. 5 (percent) or 1000 (fixed)" value={value} onChange={(e) => setValue(e.target.value)} />
          <Select label="Applies to" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)}>
            <option value="order">order</option>
            <option value="shipping">shipping</option>
            <option value="ads">ads</option>
            <option value="subscription">subscription</option>
          </Select>
          <Select label="Active" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="1">true</option>
            <option value="0">false</option>
          </Select>
        </div>

        <div className="rowEnd" style={{ marginTop: 12 }}>
          <Button onClick={save} loading={saving}>Save Rule</Button>
        </div>

        <div className="muted" style={{ marginTop: 10 }}>
          Note: listing endpoint for fees is not in your route file; add one later if you want list/edit UI.
        </div>
      </Card>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
