import React, { useEffect, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { superApi } from "../api/super.api.js";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currency, setCurrency] = useState("TZS");
  const [escrowDays, setEscrowDays] = useState("3");
  const [maintenanceMode, setMaintenanceMode] = useState("0");

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function load() {
    setLoading(true);
    try {
      const res = await superApi.getSettings();
      const d = res?.data || res;
      setCurrency(d?.currency ?? "TZS");
      setEscrowDays(String(d?.escrow_days ?? 3));
      setMaintenanceMode(String(d?.maintenance_mode ? 1 : 0));
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await superApi.updateSettings({
        currency,
        escrow_days: Number(escrowDays),
        maintenance_mode: maintenanceMode === "1"
      });
      setToast({ open: true, tone: "success", message: "Settings updated." });
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="stack gap-lg">
      <PageHeader title="Platform Settings" subtitle="Super admin configuration" right={<Button variant="secondary" onClick={load}>Reload</Button>} />

      <Card title="Settings" subtitle="Super: GET/PUT /api/v1/admin/super/settings">
        {loading ? <Loader label="Loading settings..." /> : null}

        {!loading ? (
          <>
            <div className="grid2">
              <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              <Input label="Escrow days" value={escrowDays} onChange={(e) => setEscrowDays(e.target.value)} />
              <Input
                label="Maintenance mode (0/1)"
                value={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.value)}
                hint="0 = off, 1 = on"
              />
            </div>
            <div className="rowEnd" style={{ marginTop: 12 }}>
              <Button onClick={save} loading={saving}>Save Settings</Button>
            </div>
          </>
        ) : null}
      </Card>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
