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

export default function VendorApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const params = useMemo(() => {
    const p = { status: statusFilter || "pending" };
    if (search) p.search = search;
    return p;
  }, [search, statusFilter]);

  const { loading, error, data, reload } = useListResource({
    url: "/api/v1/admin/vendor-applications",
    params
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState("approved");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  const applications = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  function openDetail(app) {
    setSelectedApp(app);
    setDetailOpen(true);
  }

  function closeDetail() {
    setDetailOpen(false);
  }

  function openReview(app) {
    setSelectedApp(app);
    setReviewDecision("approved");
    setRejectionReason("");
    setReviewOpen(true);
  }

  function closeReview() {
    if (reviewing) return;
    setReviewOpen(false);
  }

  async function handleReview() {
    if (reviewing || !selectedApp) return;
    setReviewing(true);

    try {
      await adminApi.reviewVendorApplication(selectedApp.id, {
        status: reviewDecision,
        rejection_reason: reviewDecision === "rejected" ? rejectionReason : null
      });

      const message = 
        reviewDecision === "approved" 
          ? "Vendor application approved. Vendor account created."
          : "Vendor application rejected.";
      
      setToast({ open: true, tone: "success", message });
      setReviewOpen(false);
      reload();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to review application.";
      setToast({ open: true, tone: "danger", message });
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Vendor Applications"
        subtitle="Review and manage vendor application submissions"
        right={<Button variant="secondary" onClick={reload}>Refresh</Button>}
      />

      <Card title="Filters" subtitle="Search and filter applications">
        <div className="grid2">
          <Input 
            label="Search" 
            placeholder="Business name, email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <Select 
            label="Status" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </Select>
        </div>
      </Card>

      <Card
        title="Applications"
        subtitle="GET /api/v1/admin/vendor-applications"
        actions={(
          <Button type="button" variant="secondary" onClick={reload}>
            Refresh
          </Button>
        )}
      >
        {loading ? <Loader label="Loading applications..." /> : null}
        {error ? <div className="alert alert--danger">{error}</div> : null}
        
        <Table
          columns={[
            { key: "id", header: "ID", width: "60px" },
            {
              key: "business_name",
              header: "Business",
              width: "220px",
              render: (row) => (
                <div>
                  <strong>{safeText(row.business_name)}</strong>
                  <div className="muted" style={{ fontSize: "0.85em" }}>
                    {safeText(row.business_email)}
                  </div>
                </div>
              )
            },
            {
              key: "full_name",
              header: "Applicant",
              width: "180px",
              render: (row) => (
                <div>
                  <strong>{safeText(row.full_name)}</strong>
                  <div className="muted" style={{ fontSize: "0.85em" }}>
                    {safeText(row.user?.email || "-")}
                  </div>
                </div>
              )
            },
            {
              key: "region",
              header: "Location",
              width: "140px",
              render: (row) => (
                <div>
                  <strong>{safeText(row.region)}</strong>
                  <div className="muted" style={{ fontSize: "0.85em" }}>
                    {safeText(row.city || "-")}
                  </div>
                </div>
              )
            },
            {
              key: "status",
              header: "Status",
              width: "120px",
              render: (row) => {
                const tones = {
                  pending: "warning",
                  approved: "success",
                  rejected: "danger"
                };
                return <Badge tone={tones[row.status] || "neutral"}>{safeText(row.status)}</Badge>;
              }
            },
            {
              key: "created_at",
              header: "Submitted",
              width: "140px",
              render: (row) => {
                const date = new Date(row.created_at);
                return date.toLocaleDateString();
              }
            },
            {
              key: "actions",
              header: "Actions",
              width: "180px",
              render: (row) => (
                <div className="row gap-sm">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => openDetail(row)}
                  >
                    View
                  </Button>
                  {row.status === "pending" && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => openReview(row)}
                    >
                      Review
                    </Button>
                  )}
                </div>
              )
            }
          ]}
          rows={applications}
          emptyText="No applications found."
        />
      </Card>

      {/* Detail Modal */}
      <Modal 
        open={detailOpen} 
        title={selectedApp ? `Application — ${selectedApp.business_name}` : "Application details"} 
        onClose={closeDetail} 
        footer={null}
      >
        {selectedApp ? (
          <div className="stack gap-lg">
            <div className="grid2 gap-md">
              <div>
                <div className="muted">Business Name</div>
                <strong>{safeText(selectedApp.business_name)}</strong>
              </div>
              <div>
                <div className="muted">Business Email</div>
                <strong>{safeText(selectedApp.business_email)}</strong>
              </div>
              <div>
                <div className="muted">Applicant Name</div>
                <strong>{safeText(selectedApp.full_name)}</strong>
              </div>
              <div>
                <div className="muted">Phone</div>
                <strong>{safeText(selectedApp.phone)}</strong>
              </div>
              <div>
                <div className="muted">Status</div>
                <Badge tone={selectedApp.status === "approved" ? "success" : selectedApp.status === "pending" ? "warning" : "danger"}>
                  {safeText(selectedApp.status)}
                </Badge>
              </div>
              <div>
                <div className="muted">Submitted</div>
                <strong>{new Date(selectedApp.created_at).toLocaleString()}</strong>
              </div>
            </div>

            <div>
              <div className="muted">Description</div>
              <p>{safeText(selectedApp.description) || "No description provided"}</p>
            </div>

            <div className="grid3 gap-md">
              <div>
                <div className="muted">Address</div>
                <strong>{safeText(selectedApp.address)}</strong>
              </div>
              <div>
                <div className="muted">Ward</div>
                <strong>{safeText(selectedApp.ward)}</strong>
              </div>
              <div>
                <div className="muted">Street</div>
                <strong>{safeText(selectedApp.street)}</strong>
              </div>
              <div>
                <div className="muted">Region</div>
                <strong>{safeText(selectedApp.region)}</strong>
              </div>
              <div>
                <div className="muted">City</div>
                <strong>{safeText(selectedApp.city) || "-"}</strong>
              </div>
            </div>

            <div>
              <div className="muted">Applicant Email</div>
              <strong>{safeText(selectedApp.user?.email)}</strong>
            </div>

            {selectedApp.status === "rejected" && selectedApp.rejection_reason && (
              <div className="alert alert--warning">
                <div className="muted">Rejection Reason</div>
                <p>{safeText(selectedApp.rejection_reason)}</p>
              </div>
            )}

            <div className="row rowEnd gap-sm">
              <Button type="button" variant="secondary" onClick={closeDetail}>
                Close
              </Button>
              {selectedApp.status === "pending" && (
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={() => {
                    closeDetail();
                    openReview(selectedApp);
                  }}
                >
                  Review Application
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="muted">Select an application to view details.</div>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal 
        open={reviewOpen} 
        title={selectedApp ? `Review — ${selectedApp.business_name}` : "Review application"} 
        onClose={closeReview}
        footer={null}
      >
        {selectedApp ? (
          <div className="stack gap-md">
            <div className="stack gap-sm">
              <div>
                <strong className="muted">Business Name</strong>
                <p style={{ margin: "4px 0" }}>{safeText(selectedApp.business_name)}</p>
              </div>
              <div>
                <strong className="muted">Applicant</strong>
                <p style={{ margin: "4px 0" }}>{safeText(selectedApp.full_name)} ({safeText(selectedApp.user?.email)})</p>
              </div>
              <div>
                <strong className="muted">Location</strong>
                <p style={{ margin: "4px 0" }}>{safeText(selectedApp.region)}, {safeText(selectedApp.city)}</p>
              </div>
            </div>

            <div>
              <label>Decision *</label>
              <Select 
                value={reviewDecision}
                onChange={(e) => setReviewDecision(e.target.value)}
                disabled={reviewing}
              >
                <option value="approved">Approve Application</option>
                <option value="rejected">Reject Application</option>
              </Select>
            </div>

            {reviewDecision === "rejected" && (
              <div>
                <label>Rejection Reason *</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Why are you rejecting this application?"
                  rows={4}
                  disabled={reviewing}
                />
              </div>
            )}

            <div className="row rowEnd gap-sm">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={closeReview}
                disabled={reviewing}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant={reviewDecision === "approved" ? "primary" : "secondary"}
                loading={reviewing}
                onClick={handleReview}
              >
                {reviewing ? "Processing..." : (reviewDecision === "approved" ? "Approve" : "Reject")}
              </Button>
            </div>
          </div>
        ) : null}
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
