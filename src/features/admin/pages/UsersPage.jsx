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
import { authApi } from "../../auth/api/auth.api.js";
import { safeText } from "../../../utils/formatters.js";

const createDefaults = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "customer"
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (status) p.status = status;
    if (role) p.role = role;
    return p;
  }, [search, status, role]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/users",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });
  const [statusBanner, setStatusBanner] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(createDefaults);
  const [createStatus, setCreateStatus] = useState(null);

  function openStatusModal(row) {
    setSelected(row);
    setNewStatus(row?.status || "active");
    setReason("");
    setOpen(true);
  }

  function openCreateModal() {
    setCreateForm(createDefaults);
    setCreateStatus(null);
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateOpen(false);
  }

  async function saveStatus() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.updateUserStatus(selected.id, { status: newStatus, reason });
      setToast({ open: true, tone: "success", message: "User status updated." });
      setStatusBanner("User status updated.");
      setOpen(false);
      reload();
    } catch (e) {
      setToast({
        open: true,
        tone: "danger",
        message: e?.response?.data?.message || "Failed to update status."
      });
    } finally {
      setSaving(false);
    }
  }

  function handleCreateChange(field, value) {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (creating) return;

    setCreateStatus(null);
    setCreating(true);

    try {
      await authApi.register({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim(),
        password: createForm.password,
        role: createForm.role
      });

      setToast({ open: true, tone: "success", message: "User added. Verification email sent." });
      setCreateOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create user.";
      setCreateStatus({ type: "error", message });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Users"
        subtitle="View and manage user accounts"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card
        title="Filters"
        subtitle="Search and narrow results"
      >
        <div className="grid3">
          <Input label="Search" placeholder="Name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="blocked">blocked</option>
          </Select>
          <Input label="Role (optional)" placeholder="customer/vendor/admin..." value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
      </Card>

      <Card
        title="Users List"
        subtitle="Admin: GET /api/v1/admin/users"
        actions={(
          <div className="row gap-sm">
            <Button type="button" variant="secondary" onClick={reload}>
              Refresh
            </Button>
            <Button type="button" variant="primary" onClick={openCreateModal}>
              Add New User
            </Button>
          </div>
        )}
      >
        {loading ? <Loader label="Loading users..." /> : null}
        {statusBanner ? (
          <div className="alert alert--success">{statusBanner}</div>
        ) : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "name", header: "Name", width: "220px", render: (r) => safeText(r.name) },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone", width: "160px" },
            {
              key: "status",
              header: "Status",
              width: "140px",
              render: (r) => {
                const tone =
                  r.status === "active" ? "success" : r.status === "suspended" ? "warning" : "danger";
                return <Badge tone={tone}>{safeText(r.status)}</Badge>;
              }
            },
            {
              key: "actions",
              header: "Actions",
              width: "160px",
              render: (r) => (
                <Button variant="secondary" size="sm" onClick={() => openStatusModal(r)}>
                  Update Status
                </Button>
              )
            }
          ]}
          rows={data}
          emptyText="No users found."
        />
      </Card>

      <Modal
        open={open}
        title={`Update Status — ${selected?.name || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveStatus} loading={saving}>Save</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="New status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="blocked">blocked</option>
          </Select>
          <Input label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Short reason..." />
        </div>
      </Modal>

      <Modal open={createOpen} title="Add New User" onClose={closeCreateModal} footer={null}>
        <form className="stack gap-md" onSubmit={handleCreateUser}>
          <Input
            label="Full name"
            value={createForm.name}
            required
            onChange={(e) => handleCreateChange("name", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={createForm.email}
            required
            onChange={(e) => handleCreateChange("email", e.target.value)}
            hint="A verification email will be sent automatically"
          />
          <Input
            label="Phone"
            value={createForm.phone}
            required
            onChange={(e) => handleCreateChange("phone", e.target.value)}
          />
          <Input
            label="Temporary password"
            type="password"
            value={createForm.password}
            required
            onChange={(e) => handleCreateChange("password", e.target.value)}
          />
          <Select label="Role" value={createForm.role} onChange={(e) => handleCreateChange("role", e.target.value)}>
            <option value="customer">customer</option>
            <option value="individual_vendor">individual vendor</option>
            <option value="business_vendor">business vendor</option>
            
          </Select>

          {createStatus ? (
            <div className={`alert ${createStatus.type === "error" ? "alert--danger" : "alert--success"}`}>
              {createStatus.message}
            </div>
          ) : null}

          <div className="row rowEnd gap-sm">
            <Button type="button" variant="secondary" onClick={closeCreateModal} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create user
            </Button>
          </div>
        </form>
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
