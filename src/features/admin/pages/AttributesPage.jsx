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

const typeOptions = [
  { value: "select", label: "Select (dropdown)" },
  { value: "color", label: "Color swatch" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
];

const boolOptions = [
  { value: "1", label: "Yes" },
  { value: "0", label: "No" },
];

function parseBool(value) {
  return value === "1" || value === true || value === "true";
}

export default function AttributesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAttribute, setDetailAttribute] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    type: "select",
    is_variant_attribute: "1",
    is_filterable: "1",
    sort_order: "0",
    values: "",
  });
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    type: "select",
    is_variant_attribute: "1",
    is_filterable: "1",
    sort_order: "0",
    values: "",
  });
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState(null);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  const params = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (typeFilter) p.type = typeFilter;
    if (variantFilter) p.is_variant_attribute = variantFilter;
    return p;
  }, [search, typeFilter, variantFilter]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/attributes",
    params,
  });

  const attributes = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const totals = useMemo(() => {
    const total = attributes.length;
    const variant = attributes.filter((a) => a.is_variant_attribute).length;
    const filterable = attributes.filter((a) => a.is_filterable).length;
    return { total, variant, filterable };
  }, [attributes]);

  const filteredRows = useMemo(() => {
    return attributes.filter((attr) => {
      if (typeFilter && attr.type !== typeFilter) return false;
      if (variantFilter && String(attr.is_variant_attribute) !== variantFilter) return false;
      return true;
    });
  }, [attributes, typeFilter, variantFilter]);

  function openDetail(attribute) {
    setDetailAttribute(attribute);
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  function openCreateModal() {
    setCreateForm({
      name: "",
      code: "",
      type: "select",
      is_variant_attribute: "1",
      is_filterable: "1",
      sort_order: "0",
      values: "",
    });
    setCreateStatus(null);
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateOpen(false);
  }

  function handleCreateChange(field, value) {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateAttribute(e) {
    e.preventDefault();
    if (creating) return;
    setCreateStatus(null);
    setCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        code: createForm.code.trim() || undefined,
        type: createForm.type,
        is_variant_attribute: parseBool(createForm.is_variant_attribute),
        is_filterable: parseBool(createForm.is_filterable),
        sort_order: Number(createForm.sort_order) || 0,
        values: createForm.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };

      await adminApi.createAttribute(payload);
      setToast({ open: true, tone: "success", message: "Attribute created." });
      setCreateOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create attribute.";
      setCreateStatus({ type: "error", message });
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(attribute) {
    setEditingId(attribute.id);
    setEditForm({
      name: attribute.name || "",
      code: attribute.code || "",
      type: attribute.type || "select",
      is_variant_attribute: attribute.is_variant_attribute ? "1" : "0",
      is_filterable: attribute.is_filterable ? "1" : "0",
      sort_order: String(attribute.sort_order ?? 0),
      values: Array.isArray(attribute.values)
        ? attribute.values.map((v) => v.value).join(", ")
        : "",
    });
    setEditStatus(null);
    setEditOpen(true);
  }

  function closeEditModal() {
    if (updating) return;
    setEditOpen(false);
  }

  function handleEditChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleUpdateAttribute(e) {
    e.preventDefault();
    if (updating || !editingId) return;
    setEditStatus(null);
    setUpdating(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        code: editForm.code.trim() || undefined,
        type: editForm.type,
        is_variant_attribute: parseBool(editForm.is_variant_attribute),
        is_filterable: parseBool(editForm.is_filterable),
        sort_order: Number(editForm.sort_order) || 0,
        values: editForm.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };

      await adminApi.updateAttribute(editingId, payload);
      setToast({ open: true, tone: "success", message: "Attribute updated." });
      setEditOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to update attribute.";
      setEditStatus({ type: "error", message });
    } finally {
      setUpdating(false);
    }
  }

  function openDeleteModal(attribute) {
    setDeletingId(attribute.id);
    setDeleteStatus(null);
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (deleting) return;
    setDeleteOpen(false);
  }

  async function handleDeleteAttribute() {
    if (deleting || !deletingId) return;
    setDeleteStatus(null);
    setDeleting(true);
    try {
      await adminApi.deleteAttribute(deletingId);
      setToast({ open: true, tone: "success", message: "Attribute deleted." });
      setDeleteOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to delete attribute.";
      setDeleteStatus({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Attributes"
        subtitle="Manage product variant and filter attributes"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <div className="categoriesStats">
        <Card className="categoriesStats__card" title="Total attributes" subtitle="Across all types">
          <div className="categoriesStats__value">{totals.total}</div>
        </Card>
        <Card className="categoriesStats__card" title="Variant attributes" subtitle="Visible to vendors">
          <div className="categoriesStats__value categoriesStats__value--success">{totals.variant}</div>
        </Card>
        <Card className="categoriesStats__card" title="Filterable" subtitle="Used in storefront filters">
          <div className="categoriesStats__value categoriesStats__value--muted">{totals.filterable}</div>
        </Card>
      </div>

      <Card title="Filters" subtitle="Search and filter attributes">
        <div className="grid3">
          <Input label="Search" placeholder="Name or code..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Select label="Is Variant" value={variantFilter} onChange={(e) => setVariantFilter(e.target.value)}>
            <option value="">All</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </Select>
        </div>
      </Card>

      <Card
        title="Attributes"
        subtitle="GET /api/v1/admin/attributes"
        actions={(
          <div className="row gap-sm">
            <Button type="button" variant="secondary" onClick={reload}>Refresh</Button>
            <Button type="button" variant="primary" onClick={openCreateModal}>Add Attribute</Button>
          </div>
        )}
      >
        {loading ? <Loader label="Loading attributes..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}
        <Table
          columns={[
            { key: "id", header: "ID", width: "80px" },
            {
              key: "name",
              header: "Attribute",
              width: "240px",
              render: (row) => (
                <div>
                  <strong>{safeText(row.name)}</strong>
                  <div className="muted" style={{ fontSize: "0.85em" }}>/{safeText(row.code)}</div>
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              width: "140px",
              render: (row) => {
                const t = typeOptions.find((o) => o.value === row.type);
                return safeText(t?.label || row.type);
              },
            },
            {
              key: "values_count",
              header: "Values",
              width: "90px",
              render: (row) => Array.isArray(row.values) ? row.values.length : 0,
            },
            {
              key: "is_variant_attribute",
              header: "Variant",
              width: "100px",
              render: (row) => (
                <Badge tone={row.is_variant_attribute ? "success" : "neutral"}>
                  {row.is_variant_attribute ? "Yes" : "No"}
                </Badge>
              ),
            },
            {
              key: "is_filterable",
              header: "Filterable",
              width: "100px",
              render: (row) => (
                <Badge tone={row.is_filterable ? "success" : "neutral"}>
                  {row.is_filterable ? "Yes" : "No"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              width: "220px",
              render: (row) => (
                <div className="row gap-sm">
                  <Button variant="secondary" size="sm" onClick={() => openDetail(row)}>
                    View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => openDeleteModal(row)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          rows={filteredRows}
          emptyText="No attributes found."
        />
      </Card>

      <Modal open={detailOpen} title={detailAttribute ? `Attribute — ${detailAttribute.name}` : "Attribute details"} onClose={closeDetail} footer={null}>
        {detailAttribute ? (
          <div className="stack gap-md categoriesDetail">
            <div className="categoriesDetail__grid">
              <div>
                <div className="muted">Name</div>
                <strong>{safeText(detailAttribute.name)}</strong>
              </div>
              <div>
                <div className="muted">Code</div>
                <strong>/{safeText(detailAttribute.code)}</strong>
              </div>
              <div>
                <div className="muted">Type</div>
                <strong>{safeText(detailAttribute.type)}</strong>
              </div>
              <div>
                <div className="muted">Sort Order</div>
                <strong>{detailAttribute.sort_order ?? 0}</strong>
              </div>
              <div>
                <div className="muted">Variant Attribute</div>
                <Badge tone={detailAttribute.is_variant_attribute ? "success" : "neutral"}>
                  {detailAttribute.is_variant_attribute ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <div className="muted">Filterable</div>
                <Badge tone={detailAttribute.is_filterable ? "success" : "neutral"}>
                  {detailAttribute.is_filterable ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            <div>
              <div className="muted">Values</div>
              <div className="row gap-sm" style={{ flexWrap: "wrap", marginTop: "8px" }}>
                {Array.isArray(detailAttribute.values) && detailAttribute.values.length > 0 ? (
                  detailAttribute.values.map((v) => (
                    <Badge key={v.id} tone="secondary">{safeText(v.value)}</Badge>
                  ))
                ) : (
                  <span className="muted">No values</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="muted">Select an attribute to see details.</div>
        )}
      </Modal>

      <Modal open={createOpen} title="Add Attribute" onClose={closeCreateModal} footer={null}>
        <form className="stack gap-md" onSubmit={handleCreateAttribute}>
          <Input label="Name" value={createForm.name} required onChange={(e) => handleCreateChange("name", e.target.value)} />
          <Input label="Code (optional)" value={createForm.code} onChange={(e) => handleCreateChange("code", e.target.value)} />
          <Select label="Type" value={createForm.type} onChange={(e) => handleCreateChange("type", e.target.value)}>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Select label="Is Variant Attribute" value={createForm.is_variant_attribute} onChange={(e) => handleCreateChange("is_variant_attribute", e.target.value)}>
            {boolOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select label="Is Filterable" value={createForm.is_filterable} onChange={(e) => handleCreateChange("is_filterable", e.target.value)}>
            {boolOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Input label="Sort Order" type="number" min="0" value={createForm.sort_order} onChange={(e) => handleCreateChange("sort_order", e.target.value)} />
          <Input
            label="Values"
            value={createForm.values}
            onChange={(e) => handleCreateChange("values", e.target.value)}
            placeholder="Red, Blue, Green, Black"
          />
          <p className="muted" style={{ marginTop: "-8px" }}>Comma-separated list of preset values</p>

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
              Create attribute
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editOpen} title={editingId ? "Edit Attribute" : "Edit attribute"} onClose={closeEditModal} footer={null}>
        <form className="stack gap-md" onSubmit={handleUpdateAttribute}>
          <Input label="Name" value={editForm.name} required onChange={(e) => handleEditChange("name", e.target.value)} />
          <Input label="Code" value={editForm.code} onChange={(e) => handleEditChange("code", e.target.value)} />
          <Select label="Type" value={editForm.type} onChange={(e) => handleEditChange("type", e.target.value)}>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Select label="Is Variant Attribute" value={editForm.is_variant_attribute} onChange={(e) => handleEditChange("is_variant_attribute", e.target.value)}>
            {boolOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select label="Is Filterable" value={editForm.is_filterable} onChange={(e) => handleEditChange("is_filterable", e.target.value)}>
            {boolOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Input label="Sort Order" type="number" min="0" value={editForm.sort_order} onChange={(e) => handleEditChange("sort_order", e.target.value)} />
          <Input
            label="Values"
            value={editForm.values}
            onChange={(e) => handleEditChange("values", e.target.value)}
            placeholder="Red, Blue, Green, Black"
          />
          <p className="muted" style={{ marginTop: "-8px" }}>Comma-separated list of preset values. Removing a value deletes it from the database.</p>

          {editStatus ? (
            <div className={`alert ${editStatus.type === "error" ? "alert--danger" : "alert--success"}`}>
              {editStatus.message}
            </div>
          ) : null}

          <div className="row rowEnd gap-sm">
            <Button type="button" variant="secondary" onClick={closeEditModal} disabled={updating}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Update attribute
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteOpen} title="Delete Attribute" onClose={closeDeleteModal} footer={null}>
        <div className="stack gap-md">
          <div>
            <p>Are you sure you want to delete this attribute? This action cannot be undone.</p>
            <p style={{ fontSize: "0.9em", color: "#999", marginTop: "8px" }}>
              Note: Attributes linked to product variants cannot be deleted.
            </p>
          </div>

          {deleteStatus ? (
            <div className={`alert ${deleteStatus.type === "error" ? "alert--danger" : "alert--success"}`}>
              {deleteStatus.message}
            </div>
          ) : null}

          <div className="row rowEnd gap-sm">
            <Button type="button" variant="secondary" onClick={closeDeleteModal} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleDeleteAttribute}>
              Delete attribute
            </Button>
          </div>
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
