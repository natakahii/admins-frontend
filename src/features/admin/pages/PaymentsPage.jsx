import React, { useMemo, useState, useEffect } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Table from "../../../components/ui/Table.jsx";
import Input from "../../../components/ui/Input.jsx";
import Button from "../../../components/ui/Button.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import { useListResource } from "../../shared/hooks/useListResource.js";
import { safeText, formatCurrency } from "../../../utils/formatters.js";

const PAYMENT_STATUSES = ["initiated", "pending", "successful", "failed", "expired"];
const PAYMENT_METHODS = ["mpesa", "airtel_money", "tigo_pesa", "halopesa", "card", "bank_transfer"];
const PAYOUT_STATUSES = ["pending", "queued", "processing", "completed", "failed", "reversed"];
const REFUND_STATUSES = ["initiated", "pending", "successful", "failed"];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("payments");
  const [provider, setProvider] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderId, setOrderId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Payout filters
  const [payoutStatus, setPayoutStatus] = useState("");
  const [vendorId, setVendorId] = useState("");

  // Refund filters
  const [refundStatus, setRefundStatus] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_payouts: 0,
    pending_payouts: 0,
    total_refunds: 0,
    failed_payments: 0,
  });

  const paymentParams = useMemo(() => {
    const p = {};
    if (provider) p.provider = provider;
    if (paymentStatus) p.status = paymentStatus;
    if (paymentMethod) p.payment_method = paymentMethod;
    if (orderId) p.order_id = orderId;
    if (dateFrom) p.date_from = dateFrom;
    if (dateTo) p.date_to = dateTo;
    return p;
  }, [provider, paymentStatus, paymentMethod, orderId, dateFrom, dateTo]);

  const payoutParams = useMemo(() => {
    const p = {};
    if (payoutStatus) p.status = payoutStatus;
    if (vendorId) p.vendor_id = vendorId;
    return p;
  }, [payoutStatus, vendorId]);

  const refundParams = useMemo(() => {
    const p = {};
    if (refundStatus) p.status = refundStatus;
    return p;
  }, [refundStatus]);

  const { loading: paymentLoading, error: paymentError, data: payments, reload: reloadPayments } = useListResource({
    url: "/api/v1/admin/payments",
    params: paymentParams
  });

  const { loading: payoutLoading, error: payoutError, data: payouts, reload: reloadPayouts } = useListResource({
    url: "/api/v1/admin/payouts",
    params: payoutParams
  });

  const { loading: refundLoading, error: refundError, data: refunds, reload: reloadRefunds } = useListResource({
    url: "/api/v1/admin/refunds",
    params: refundParams
  });

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/v1/admin/payments/stats");
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error("Failed to load payment stats:", error);
      }
    };
    loadStats();
  }, []);

  const handleRefresh = () => {
    if (activeTab === "payments") reloadPayments();
    else if (activeTab === "payouts") reloadPayouts();
    else if (activeTab === "refunds") reloadRefunds();
  };

  const clearFilters = () => {
    if (activeTab === "payments") {
      setProvider("");
      setPaymentStatus("");
      setPaymentMethod("");
      setOrderId("");
      setDateFrom("");
      setDateTo("");
    } else if (activeTab === "payouts") {
      setPayoutStatus("");
      setVendorId("");
    } else if (activeTab === "refunds") {
      setRefundStatus("");
    }
  };

  return (
    <div className="stack gap-lg">
      <PageHeader 
        title="Payments & Transactions" 
        subtitle="Monitor payments, payouts, and refunds"
        right={<Button variant="secondary" onClick={handleRefresh}>Refresh</Button>} 
      />

      {/* Stats Cards */}
      <div className="grid4">
        <Card title="Total Revenue" subtitle="From commissions">
          <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue || 0)}</div>
        </Card>
        <Card title="Total Payouts" subtitle="Paid to vendors">
          <div className="text-2xl font-bold">{formatCurrency(stats.total_payouts || 0)}</div>
        </Card>
        <Card title="Pending Payouts" subtitle="Awaiting processing">
          <div className="text-2xl font-bold">{formatCurrency(stats.pending_payouts || 0)}</div>
        </Card>
        <Card title="Failed Payments" subtitle="Require attention">
          <div className="text-2xl font-bold">{stats.failed_payments || 0}</div>
        </Card>
      </div>

      {/* Tabs */}
      <Card title="Transaction Type" subtitle="Select which transactions to view">
        <div className="flex gap-md">
          <Button 
            variant={activeTab === "payments" ? "primary" : "secondary"}
            onClick={() => setActiveTab("payments")}
          >
            Payments
          </Button>
          <Button 
            variant={activeTab === "payouts" ? "primary" : "secondary"}
            onClick={() => setActiveTab("payouts")}
          >
            Payouts
          </Button>
          <Button 
            variant={activeTab === "refunds" ? "primary" : "secondary"}
            onClick={() => setActiveTab("refunds")}
          >
            Refunds
          </Button>
        </div>
      </Card>

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <>
          <Card title="Payment Filters" subtitle="Search and filter payments">
            <div className="grid4">
              <Input 
                label="Provider" 
                placeholder="mpesa, tigo, airtel..." 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)} 
              />
              <Input 
                label="Status" 
                placeholder="successful, failed..." 
                value={paymentStatus} 
                onChange={(e) => setPaymentStatus(e.target.value)} 
              />
              <Input 
                label="Payment Method" 
                placeholder="mpesa, card, bank..." 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
              />
              <Input 
                label="Order ID" 
                placeholder="e.g. 900" 
                value={orderId} 
                onChange={(e) => setOrderId(e.target.value)} 
              />
              <Input 
                label="From Date" 
                type="date"
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
              />
              <Input 
                label="To Date" 
                type="date"
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
              />
            </div>
            {(provider || paymentStatus || paymentMethod || orderId || dateFrom || dateTo) && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          </Card>

          <Card title="Payment Transactions" subtitle="All customer payments">
            {paymentLoading ? <Loader label="Loading payments..." /> : null}
            {paymentError ? <div className="alert alert--danger">{paymentError}</div> : null}

            <Table
              columns={[
                { key: "id", header: "ID", width: "70px" },
                { key: "order_id", header: "Order", width: "80px" },
                { key: "amount", header: "Amount", width: "120px", render: (r) => formatCurrency(r.amount) },
                { key: "payment_method", header: "Method", width: "120px", render: (r) => safeText(r.payment_method) },
                { key: "provider", header: "Provider", width: "100px", render: (r) => safeText(r.provider) },
                { key: "status", header: "Status", width: "100px", render: (r) => {
                  const statusColors = {
                    successful: "success",
                    failed: "danger",
                    pending: "warning",
                    initiated: "info",
                    expired: "secondary"
                  };
                  return <span className={`badge badge--${statusColors[r.status] || 'secondary'}`}>{r.status}</span>;
                } },
                { key: "created_at", header: "Date", width: "150px", render: (r) => new Date(r.created_at).toLocaleDateString() }
              ]}
              rows={payments}
              emptyText="No payments found."
            />
          </Card>
        </>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <>
          <Card title="Payout Filters" subtitle="Search and filter payouts">
            <div className="grid3">
              <Input 
                label="Status" 
                placeholder="pending, processing, completed..." 
                value={payoutStatus} 
                onChange={(e) => setPayoutStatus(e.target.value)} 
              />
              <Input 
                label="Vendor ID" 
                placeholder="e.g. 123" 
                value={vendorId} 
                onChange={(e) => setVendorId(e.target.value)} 
              />
            </div>
            {(payoutStatus || vendorId) && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          </Card>

          <Card title="Vendor Payouts" subtitle="All payout requests and status">
            {payoutLoading ? <Loader label="Loading payouts..." /> : null}
            {payoutError ? <div className="alert alert--danger">{payoutError}</div> : null}

            <Table
              columns={[
                { key: "id", header: "ID", width: "70px" },
                { key: "vendor_id", header: "Vendor", width: "80px" },
                { key: "amount", header: "Amount", width: "120px", render: (r) => formatCurrency(r.amount) },
                { key: "payment_method", header: "Method", width: "120px", render: (r) => safeText(r.payment_method) },
                { key: "status", header: "Status", width: "100px", render: (r) => {
                  const statusColors = {
                    completed: "success",
                    failed: "danger",
                    processing: "warning",
                    pending: "info",
                    queued: "info",
                    reversed: "secondary"
                  };
                  return <span className={`badge badge--${statusColors[r.status] || 'secondary'}`}>{r.status}</span>;
                } },
                { key: "attempt_count", header: "Attempts", width: "80px", render: (r) => `${r.attempt_count}/${r.max_attempts}` },
                { key: "created_at", header: "Requested", width: "150px", render: (r) => new Date(r.created_at).toLocaleDateString() }
              ]}
              rows={payouts}
              emptyText="No payouts found."
            />
          </Card>
        </>
      )}

      {/* Refunds Tab */}
      {activeTab === "refunds" && (
        <>
          <Card title="Refund Filters" subtitle="Search and filter refunds">
            <div className="grid2">
              <Input 
                label="Status" 
                placeholder="initiated, pending, successful, failed" 
                value={refundStatus} 
                onChange={(e) => setRefundStatus(e.target.value)} 
              />
            </div>
            {refundStatus && (
              <Button variant="secondary" size="sm" onClick={clearFilters}>Clear Filters</Button>
            )}
          </Card>

          <Card title="Refund Requests" subtitle="All customer refund requests">
            {refundLoading ? <Loader label="Loading refunds..." /> : null}
            {refundError ? <div className="alert alert--danger">{refundError}</div> : null}

            <Table
              columns={[
                { key: "id", header: "ID", width: "70px" },
                { key: "order_id", header: "Order", width: "80px" },
                { key: "amount", header: "Refund Amount", width: "120px", render: (r) => formatCurrency(r.amount) },
                { key: "reason", header: "Reason", width: "150px", render: (r) => safeText(r.reason) },
                { key: "refund_type", header: "Type", width: "100px", render: (r) => safeText(r.refund_type) },
                { key: "status", header: "Status", width: "100px", render: (r) => {
                  const statusColors = {
                    successful: "success",
                    failed: "danger",
                    pending: "warning",
                    initiated: "info"
                  };
                  return <span className={`badge badge--${statusColors[r.status] || 'secondary'}`}>{r.status}</span>;
                } },
                { key: "created_at", header: "Date", width: "150px", render: (r) => new Date(r.created_at).toLocaleDateString() }
              ]}
              rows={refunds}
              emptyText="No refunds found."
            />
          </Card>
        </>
      )}
    </div>
  );
}
