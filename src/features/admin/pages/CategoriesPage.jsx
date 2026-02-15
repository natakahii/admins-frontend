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
import Textarea from "../../../components/ui/Textarea.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { adminApi } from "../api/admin.api.js";
import { safeText } from "../../../utils/formatters.js";

const createDefaults = {
  name: "",
  slug: "",
  description: "",
  visibility: "public",
  parent_id: ""
};

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getCategoryStatus(category = {}) {
  if (category.status) return category.status;
  if (category.visibility) return category.visibility;
  if (typeof category.is_active === "boolean") return category.is_active ? "active" : "inactive";
  return "active";
}

function getCategoryLevel(category = {}) {
  if (category.parent_id) return "child";
  if (Array.isArray(category.children) && category.children.length) return "parent";
  return "root";
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCategory, setDetailCategory] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(createDefaults);
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState(null);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  const params = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (visibility) p.visibility = visibility;
    if (levelFilter) p.level = levelFilter;
    return p;
  }, [search, visibility, levelFilter]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/categories",
    params
  });

  const categories = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const totals = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => ["active", "public"].includes(getCategoryStatus(c))).length;
    const hidden = categories.filter((c) => ["hidden", "draft", "private"].includes(getCategoryStatus(c))).length;
    return { total, active, hidden };
  }, [categories]);

  const filteredRows = useMemo(() => {
    return categories.filter((category) => {
      if (levelFilter && getCategoryLevel(category) !== levelFilter) return false;
      return true;
    });
  }, [categories, levelFilter]);

  function openDetail(category) {
    setDetailCategory(category);
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  function openCreateModal() {
    setCreateForm(createDefaults);
    setSlugTouched(false);
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

  function handleNameChange(value) {
    handleCreateChange("name", value);
    if (!slugTouched) {
      handleCreateChange("slug", slugify(value));
    }
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    handleCreateChange("slug", slugify(value));
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    if (creating) return;
    setCreateStatus(null);
    setCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        slug: createForm.slug.trim(),
        description: createForm.description.trim(),
        visibility: createForm.visibility,
        parent_id: createForm.parent_id || null
      };

      await adminApi.createCategory(payload);
      setToast({ open: true, tone: "success", message: "Category created." });
      setCreateOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create category.";
      setCreateStatus({ type: "error", message });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Categories"
        subtitle="Organize products with searchable, filterable categories"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <div className="categoriesStats">
        <Card className="categoriesStats__card" title="Total categories" subtitle="Across all levels">
          <div className="categoriesStats__value">{totals.total}</div>
        </Card>
        <Card className="categoriesStats__card" title="Active / Public" subtitle="Visible to shoppers">
          <div className="categoriesStats__value categoriesStats__value--success">{totals.active}</div>
        </Card>
        <Card className="categoriesStats__card" title="Hidden" subtitle="Draft or hidden">
          <div className="categoriesStats__value categoriesStats__value--muted">{totals.hidden}</div>
        </Card>
      </div>

      <Card title="Filters" subtitle="Search and drill into the tree">
        <div className="grid3">
          <Input label="Search" placeholder="Name or slug..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select label="Visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="">All</option>
            <option value="public">public</option>
            <option value="hidden">hidden</option>
            <option value="draft">draft</option>
          </Select>
          <Select label="Level" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="">Any</option>
            <option value="root">root</option>
            <option value="parent">parent</option>
            <option value="child">child</option>
          </Select>
        </div>
      </Card>

      <Card
        title="Categories"
        subtitle="GET /api/v1/categories"
        actions={(
          <div className="row gap-sm">
            <Button type="button" variant="secondary" onClick={reload}>Refresh</Button>
            <Button type="button" variant="primary" onClick={openCreateModal}>Add Category</Button>
          </div>
        )}
      >
        {loading ? <Loader label="Loading categories..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}
        <Table
          columns={[
            { key: "id", header: "ID", width: "80px" },
            {
              key: "name",
              header: "Category",
              width: "280px",
              render: (row) => (
                <div className="categoriesTable__name">
                  <strong>{safeText(row.name)}</strong>
                  <span className="muted">/{safeText(row.slug)}</span>
                </div>
              )
            },
            {
              key: "parent",
              header: "Parent",
              width: "200px",
              render: (row) => safeText(row?.parent?.name || row?.parent_name || (row.parent_id ? `#${row.parent_id}` : "-"))
            },
            {
              key: "products_count",
              header: "Products",
              width: "110px",
              render: (row) => row.products_count ?? row.products ?? 0
            },
            {
              key: "status",
              header: "Status",
              width: "140px",
              render: (row) => {
                const status = getCategoryStatus(row);
                const tone = ["active", "public"].includes(status) ? "success" : ["hidden", "draft", "private"].includes(status) ? "warning" : "neutral";
                return <Badge tone={tone}>{safeText(status)}</Badge>;
              }
            },
            {
              key: "actions",
              header: "Actions",
              width: "140px",
              render: (row) => (
                <Button variant="secondary" size="sm" onClick={() => openDetail(row)}>
                  Details
                </Button>
              )
            }
          ]}
          rows={filteredRows}
          emptyText="No categories found."
        />
      </Card>

      <Modal open={detailOpen} title={detailCategory ? `Category — ${detailCategory.name}` : "Category details"} onClose={closeDetail} footer={null}>
        {detailCategory ? (
          <div className="stack gap-md categoriesDetail">
            <div className="categoriesDetail__grid">
              <div>
                <div className="muted">Name</div>
                <strong>{safeText(detailCategory.name)}</strong>
              </div>
              <div>
                <div className="muted">Slug</div>
                <strong>/{safeText(detailCategory.slug)}</strong>
              </div>
              <div>
                <div className="muted">Level</div>
                <strong>{getCategoryLevel(detailCategory)}</strong>
              </div>
              <div>
                <div className="muted">Status</div>
                <Badge tone="secondary">{safeText(getCategoryStatus(detailCategory))}</Badge>
              </div>
            </div>
            <div>
              <div className="muted">Description</div>
              <p>{safeText(detailCategory.description) || "No description"}</p>
            </div>
            <div className="categoriesDetail__meta">
              <div>
                <div className="muted">Parent</div>
                <strong>{safeText(detailCategory?.parent?.name || detailCategory?.parent_name || "None")}</strong>
              </div>
              <div>
                <div className="muted">Products linked</div>
                <strong>{detailCategory.products_count ?? 0}</strong>
              </div>
              <div>
                <div className="muted">Updated</div>
                <strong>{safeText(detailCategory.updated_at || detailCategory.created_at || "-")}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="muted">Select a category to see details.</div>
        )}
      </Modal>

      <Modal open={createOpen} title="Add Category" onClose={closeCreateModal} footer={null}>
        <form className="stack gap-md" onSubmit={handleCreateCategory}>
          <Input label="Name" value={createForm.name} required onChange={(e) => handleNameChange(e.target.value)} />
          <Input label="Slug" value={createForm.slug} required onChange={(e) => handleSlugChange(e.target.value)} />
          <Textarea label="Description" rows={4} value={createForm.description} onChange={(e) => handleCreateChange("description", e.target.value)} />
          <Select label="Visibility" value={createForm.visibility} onChange={(e) => handleCreateChange("visibility", e.target.value)}>
            <option value="public">public</option>
            <option value="hidden">hidden</option>
            <option value="draft">draft</option>
          </Select>
          <Select label="Parent category" value={createForm.parent_id} onChange={(e) => handleCreateChange("parent_id", e.target.value)}>
            <option value="">None (root)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
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
              Create category
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
