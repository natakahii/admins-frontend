import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { vendorApi } from "../../vendor/api/vendor.api.js";
import { safeText } from "../../../utils/formatters.js";

const profileDefaults = {
  shop_name: "",
  shop_slug: "",
  description: ""
};

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getVendorIdentifier(vendor) {
  if (!vendor) return "";
  return String(vendor.user_id ?? vendor.id ?? "");
}

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

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState(null);
  const [profileForm, setProfileForm] = useState(profileDefaults);
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectionName, setSelectionName] = useState("");
  const [selectionEmail, setSelectionEmail] = useState("");
  const [selectionType, setSelectionType] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef(null);

  const vendors = Array.isArray(data) ? data : [];

  const vendorTypeOptions = useMemo(() => {
    const set = new Set();
    vendors.forEach((vendor) => {
      if (vendor?.vendor_type) set.add(vendor.vendor_type);
    });
    return Array.from(set);
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const vendorName = (vendor?.name || vendor?.shop_name || "").toLowerCase();
      const vendorEmail = (vendor?.email || vendor?.user?.email || "").toLowerCase();
      const vendorCategory = vendor?.vendor_type || "";
      const matchesName = selectionName ? vendorName.includes(selectionName.toLowerCase()) : true;
      const matchesEmail = selectionEmail ? vendorEmail.includes(selectionEmail.toLowerCase()) : true;
      const matchesType = selectionType ? vendorCategory === selectionType : true;
      return matchesName && matchesEmail && matchesType;
    });
  }, [vendors, selectionName, selectionEmail, selectionType]);

  const selectedVendor = useMemo(() => {
    return filteredVendors.find((vendor) => getVendorIdentifier(vendor) === selectedVendorId) || vendors.find((vendor) => getVendorIdentifier(vendor) === selectedVendorId) || null;
  }, [filteredVendors, vendors, selectedVendorId]);

  useEffect(() => () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => {
    if (!selectedVendor) {
      setProfileForm(profileDefaults);
      setSlugTouched(false);
      return;
    }

    setProfileForm({
      shop_name: selectedVendor.shop_name || selectedVendor.name || "",
      shop_slug:
        selectedVendor.shop_slug ||
        selectedVendor.slug ||
        slugify(selectedVendor.shop_name || selectedVendor.name || ""),
      description: selectedVendor.description || ""
    });
    setSlugTouched(false);
  }, [selectedVendor]);

  function openReview(row) {
    setSelected(row);
    setDecision("approved");
    setNotes("");
    setOpen(true);
  }

  function openCreateModal() {
    setProfileForm(profileDefaults);
    setSlugTouched(false);
    setCreateStatus(null);
    setSelectedVendorId("");
    setSelectionName("");
    setSelectionEmail("");
    setSelectionType("");
    setLogoFile(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview("");
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateOpen(false);
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

  function handleProfileChange(field, value) {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleShopNameChange(value) {
    handleProfileChange("shop_name", value);
    if (!slugTouched) {
      handleProfileChange("shop_slug", slugify(value));
    }
  }

  function handleSlugChange(value) {
    setSlugTouched(true);
    handleProfileChange("shop_slug", slugify(value));
  }

  function handleLogoChange(file) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    if (!file) {
      setLogoFile(null);
      setLogoPreview("");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleCreateVendor(e) {
    e.preventDefault();
    if (creating) return;
    if (!selectedVendor) {
      setCreateStatus({ type: "error", message: "Select a vendor before saving profile details." });
      return;
    }

    setCreateStatus(null);
    setCreating(true);

    try {
      const formData = new FormData();
      formData.append("shop_name", profileForm.shop_name.trim());
      formData.append("shop_slug", profileForm.shop_slug.trim());
      formData.append("description", profileForm.description.trim());
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      formData.append("user_id", getVendorIdentifier(selectedVendor));

      await vendorApi.createProfile(formData);

      setToast({ open: true, tone: "success", message: "Vendor profile saved." });
      setCreateOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to create vendor.";
      setCreateStatus({ type: "error", message });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Vendors"
        subtitle="Verification and vendor oversight"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card title="Filters" subtitle="Search and filter vendor list" className="vendorsCard vendorsCard--filters">
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

      <Card
        title="Vendors List"
        subtitle="Admin: GET /api/v1/admin/vendors"
        className="vendorsCard vendorsCard--table"
        actions={(
          <div className="row gap-sm">
            <Button type="button" variant="secondary" onClick={reload}>
              Refresh
            </Button>
            <Button type="button" variant="primary" onClick={openCreateModal}>
              Add Vendor Profile
            </Button>
          </div>
        )}
      >
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

      <Modal open={createOpen} title="Add Vendor Profile" onClose={closeCreateModal} footer={null} className="vendorModal">
        <form className="stack gap-md" onSubmit={handleCreateVendor}>
          <div className="vendorModal__section">
            <div>
              <div className="vendorModal__sectionTitle">Find Vendor</div>
              <div className="muted">Search for an existing vendor record to attach profile details.</div>
            </div>
            <div className="vendorModal__grid vendorModal__grid--selection">
              <Input
                label="Filter by name"
                placeholder="e.g. Smart Supplies"
                value={selectionName}
                onChange={(e) => setSelectionName(e.target.value)}
              />
              <Input
                label="Filter by email"
                type="email"
                placeholder="vendor@domain.com"
                value={selectionEmail}
                onChange={(e) => setSelectionEmail(e.target.value)}
              />
              <Select label="Filter by type" value={selectionType} onChange={(e) => setSelectionType(e.target.value)}>
                <option value="">Any type</option>
                {vendorTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
              <Select
                label="Select vendor"
                required
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
              >
                <option value="">-- Choose a vendor --</option>
                {filteredVendors.map((vendor) => (
                  <option key={getVendorIdentifier(vendor)} value={getVendorIdentifier(vendor)}>
                    {vendor.name || vendor.shop_name || "Unnamed"} — {vendor.email || vendor.user?.email || "no email"}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="vendorModal__section">
            <div>
              <div className="vendorModal__sectionTitle">Profile Details</div>
              <div className="muted">Vendor profile will be saved via /api/v1/vendor/profile</div>
            </div>
            <div className="vendorModal__grid">
              <Input label="Shop name" value={profileForm.shop_name} required onChange={(e) => handleShopNameChange(e.target.value)} />
              <Input label="Shop slug" value={profileForm.shop_slug} required onChange={(e) => handleSlugChange(e.target.value)} />
              <Textarea label="Description" rows={4} value={profileForm.description} onChange={(e) => handleProfileChange("description", e.target.value)} />
              <div className="fileDrop">
                <div className="rowBetween">
                  <div>
                    <div className="fileDrop__title">Store logo</div>
                    <div className="muted">PNG/JPG, max 2MB</div>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => logoInputRef.current?.click()}>
                    Upload
                  </Button>
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleLogoChange(e.target.files?.[0])}
                />
                {logoPreview ? (
                  <div className="fileDrop__preview">
                    <img src={logoPreview} alt="Logo preview" />
                    <Button type="button" variant="ghost" onClick={() => handleLogoChange(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="fileDrop__placeholder">No logo selected</div>
                )}
              </div>
            </div>
          </div>

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
              Save profile
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
