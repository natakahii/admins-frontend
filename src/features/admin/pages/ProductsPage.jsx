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

export default function ProductsPage() {
  const [status, setStatus] = useState("");
  const [reported, setReported] = useState("");
  const [vendorId, setVendorId] = useState("");

  const params = useMemo(() => {
    const p = {};
    if (status) p.status = status;
    if (reported) p.reported = reported;
    if (vendorId) p.vendor_id = vendorId;
    return p;
  }, [status, reported, vendorId]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/products",
    params
  });

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  function openModeration(row) {
    setSelected(row);
    setNewStatus(row?.status || "active");
    setNotes("");
    setOpen(true);
  }

  async function openProductDetail(row) {
    setDetailProduct(row);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError("");
    setDetailData(null);
    try {
      const res = await adminApi.productDetail(row.id);
      setDetailData(res);
    } catch (err) {
      setDetailError(err?.response?.data?.message || "Failed to fetch product details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveModeration() {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await adminApi.moderateProduct(selected.id, { status: newStatus, notes });
      setToast({ open: true, tone: "success", message: "Product moderation updated." });
      setOpen(false);
      reload();
    } catch (e) {
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to moderate product." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Products"
        subtitle="Moderation and visibility control"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card title="Filters" subtitle="Moderation filters">
        <div className="grid3">
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="active">active</option>
            <option value="hidden">hidden</option>
            <option value="flagged">flagged</option>
            <option value="draft">draft</option>
          </Select>
          <Select label="Reported" value={reported} onChange={(e) => setReported(e.target.value)}>
            <option value="">All</option>
            <option value="1">reported</option>
            <option value="0">not reported</option>
          </Select>
          <Input label="Vendor ID" placeholder="e.g. 8" value={vendorId} onChange={(e) => setVendorId(e.target.value)} />
        </div>
      </Card>

      <Card title="Products List" subtitle="Admin: GET /api/v1/admin/products">
        {loading ? <Loader label="Loading products..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}

        <Table
          columns={[
            { key: "id", header: "ID", width: "90px" },
            { key: "name", header: "Product", width: "320px", render: (r) => safeText(r.name) },
            { key: "vendor_id", header: "Vendor", width: "120px" },
            {
              key: "status",
              header: "Status",
              width: "140px",
              render: (r) => {
                const s = r.status;
                const tone = s === "active" ? "success" : s === "hidden" ? "warning" : "danger";
                return <Badge tone={tone}>{safeText(s)}</Badge>;
              }
            },
            {
              key: "actions",
              header: "Action",
              width: "160px",
              render: (r) => (
                <div className="row gap-xs">
                  <Button variant="secondary" size="sm" onClick={() => openModeration(r)}>
                    Moderate
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openProductDetail(r)}>
                    View
                  </Button>
                </div>
              )
            }
          ]}
          rows={data}
          emptyText="No products found."
        />
      </Card>

      <Modal
        open={open}
        title={`Moderate Product — ${selected?.name || ""}`}
        onClose={() => setOpen(false)}
        footer={
          <div className="rowEnd gap-md">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveModeration} loading={saving}>Save</Button>
          </div>
        }
      >
        <div className="stack">
          <Select label="New status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="active">active</option>
            <option value="hidden">hidden</option>
            <option value="flagged">flagged</option>
          </Select>
          <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason / notes..." />
        </div>
      </Modal>

      <Toast
        open={toast.open}
        tone={toast.tone}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <Modal
        open={detailOpen}
        title={detailProduct ? `Product Details — ${detailProduct.name}` : "Product Details"}
        onClose={() => setDetailOpen(false)}
        footer={null}
        className="productDetailModal"
      >
        {detailLoading ? <Loader label="Loading product..." /> : null}
        {detailError ? <div className="alert alert--danger">{detailError}</div> : null}
        {!detailLoading && !detailError ? (
          <ProductDetailContent data={detailData} />
        ) : null}
      </Modal>
    </div>
  );
}

function ProductDetailContent({ data }) {
  const product = data?.product || {};
  const reviews = data?.recent_reviews || [];
  const media = Array.isArray(product.images) ? product.images : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const attributes = Array.isArray(product.attributes) ? product.attributes : [];

  return (
    <div className="productDetail">
      <div className="productDetail__media">
        {media.length ? (
          media.map((img) => (
            <img key={img} src={img} alt={product.name} />
          ))
        ) : (
          <div className="productDetail__placeholder">No images available</div>
        )}
      </div>
      <div className="productDetail__meta">
        <div>
          <div className="productDetail__label">Name</div>
          <div className="productDetail__value">{safeText(product.name)}</div>
        </div>
        <div>
          <div className="productDetail__label">Price</div>
          <div className="productDetail__value">{safeText(product.price)}</div>
        </div>
        <div>
          <div className="productDetail__label">Reviews</div>
          <div className="productDetail__value">
            {safeText(product.reviews_count || 0)} reviews · {safeText(product.reviews_avg_rating || 0)} ★
          </div>
        </div>
      </div>

      <div className="productDetail__section">
        <div className="productDetail__sectionTitle">Variants</div>
        {variants.length ? (
          <div className="productDetail__chips">
            {variants.map((variant, idx) => (
              <div key={variant.id || idx} className="productDetail__chip">
                <div className="productDetail__chipName">{variant.name || `Variant ${idx + 1}`}</div>
                {variant.price ? <div className="productDetail__chipMeta">{variant.price}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No variants.</div>
        )}
      </div>

      <div className="productDetail__section">
        <div className="productDetail__sectionTitle">Attributes</div>
        {attributes.length ? (
          <dl className="productDetail__attributes">
            {attributes.map((attr, idx) => (
              <div key={attr.id || idx} className="productDetail__attribute">
                <dt>{attr.name || attr.key}</dt>
                <dd>{attr.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="muted">No attributes provided.</div>
        )}
      </div>

      <div className="productDetail__section">
        <div className="productDetail__sectionTitle">Recent Reviews</div>
        {reviews.length ? (
          <div className="productDetail__reviews">
            {reviews.map((review) => (
              <div key={review.id} className="productDetail__review">
                <div className="productDetail__reviewHeader">
                  <strong>{review.author || "Anonymous"}</strong>
                  <span>{review.rating ? `${review.rating} ★` : ""}</span>
                </div>
                <p>{review.comment || "No comment."}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No reviews yet.</div>
        )}
      </div>
    </div>
  );
}
