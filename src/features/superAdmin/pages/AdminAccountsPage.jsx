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
import { superApi } from "../api/super.api.js";
import { safeText } from "../../../utils/formatters.js";

export default function AdminAccountsPage() {
  const [search, setSearch] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    return p;
  }, [search]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/super/admins",
    params
  });

  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [adminRole, setAdminRole] = useState("normal_admin");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  async function grant() {
    setSaving(true);
    try {
      await superApi.grantAdmin({ user_id: Number(userId), admin_role: adminRole });
      setToast({ open: true, tone: "success", message: "Admin role granted." });
      setOpen(false);
      setUserId("");
      setAdminRole("normal_admin");
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to grant role." });
    } finally {
      setSaving(false);
    }
  }

  async function quickUpdate(row) {
    const next = row.admin_role === "normal_admin" ? "super_admin" : "normal_admin";
    try {
      await superApi.updateAdminRole(row.user_id || row.id, { admin_role: next });
      setToast({ open: true, tone: "success", message: "Admin role updated." });
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to update role." });
    }
  }

  async function revoke(row) {
    const ok = window.confirm("Revoke this admin access? (Cannot revoke last super admin)");
    if (!ok) return;
    try {
      await superApi.revokeAdmin(row.user_id || row.id);
      setToast({ open: true, tone: "success", message: "Admin access revoked." });
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to revoke admin." });
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Admin Accounts"
        subtitle="Manage admin roles (super admin only)"
        right={
          <div className="row gap-md">
            <Button variant="secondary" onClick={reload}>Refresh</Button>
            <Button onClick={() => setOpen(true)}>Grant Admin</Button>
          </div>
        }
      />

      <Card title="Search" subtitle="Filter admin accounts">
        <Input label="Search" placeholder="Name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </Card>

      <Card title="Admins List" subtitle="Super: GET /api/v1/admin/super/admins">
        {loading ? <Loader label="Loading admin accounts..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "user_id", header: "User ID", width: "110px", render: (r) => safeText(r.user_id || r.id) },
            { key: "name", header: "Name", width: "240px", render: (r) => safeText(r.name) },
            { key: "email", header: "Email" },
            { key: "admin_role", header: "Role", width: "160px", render: (r) => safeText(r.admin_role) },
            {
              key: "actions",
              header: "Actions",
              width: "260px",
              render: (r) => (
                <div className="row gap-sm">
                  <Button variant="secondary" size="sm" onClick={() => quickUpdate(r)}>
                    Toggle Role
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => revoke(r)}>
                    Revoke
                  </Button>
                </div>
              )
            }
          ]}
          rows={data}
          emptyText="No admin accounts found."
        />
      </Card>

      <Modal
        open={open}
        title="Grant Admin Role"
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={grant} loading={saving}>Grant</Button>
          </div>
        }
      >
        <div className="stack">
          <Input label="User ID" placeholder="Existing user id" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <Select label="Admin role" value={adminRole} onChange={(e) => setAdminRole(e.target.value)}>
            <option value="normal_admin">normal_admin</option>
            <option value="super_admin">super_admin</option>
          </Select>
        </div>
      </Modal>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
