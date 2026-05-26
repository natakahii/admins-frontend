import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Textarea from "../../../components/ui/Textarea.jsx";
import Table from "../../../components/ui/Table.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import Toast from "../../../components/feedback/Toast.jsx";
import { superApi } from "../api/super.api.js";

const featureAccessOptions = [
  {
    key: "priority_placement",
    label: "Priority marketplace placement",
    description: "Give this plan stronger storefront visibility and preferred listing placement."
  },
  {
    key: "advanced_reports",
    label: "Advanced sales reports",
    description: "Unlock deeper reporting and analytics views for the vendor."
  },
  {
    key: "campaign_tools",
    label: "Campaign and promotion tools",
    description: "Allow the vendor to run more advanced campaigns and promotion tools."
  },
  {
    key: "dedicated_support",
    label: "Dedicated support",
    description: "Give this plan access to a higher-touch vendor support lane."
  }
];

const planBenefitOptions = [
  {
    id: "standard_visibility",
    label: "Standard marketplace visibility",
    description: "Normal product visibility inside Nataka Hii.",
    aliases: ["Standard marketplace visibility"]
  },
  {
    id: "priority_placement",
    label: "Featured marketplace placement",
    description: "Stronger placement in storefront and marketplace discovery.",
    aliases: ["Featured marketplace placement", "Top-tier marketplace placement"]
  },
  {
    id: "basic_dashboard",
    label: "Basic vendor dashboard",
    description: "Core vendor dashboard and seller management tools.",
    aliases: ["Basic vendor dashboard"]
  },
  {
    id: "advanced_reports",
    label: "Advanced sales reporting",
    description: "Better analytics and sales reporting for the vendor.",
    aliases: ["Advanced sales reporting"]
  },
  {
    id: "campaign_tools",
    label: "Campaign tools",
    description: "Marketing and promotion support inside the platform.",
    aliases: ["Campaign tools", "Full analytics and campaign access"]
  },
  {
    id: "monthly_payouts",
    label: "Monthly payouts",
    description: "Standard monthly payout support for the vendor.",
    aliases: ["Monthly payouts"]
  },
  {
    id: "priority_support",
    label: "Priority vendor support",
    description: "Faster support handling than the free plan.",
    aliases: ["Priority vendor support", "Basic support"]
  },
  {
    id: "dedicated_support",
    label: "Dedicated account support",
    description: "Top-tier support for larger or premium vendors.",
    aliases: ["Dedicated account support"]
  },
  {
    id: "premium_badge",
    label: "Premium verification badge",
    description: "Customer-facing premium verification for paid vendor plans.",
    aliases: ["Premium verification badge"]
  }
];

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  billing_cycle: "monthly",
  is_active: "true",
  is_free: "false",
  product_limit: "",
  sort_order: "0",
  selected_feature_ids: [],
  custom_features: "",
  feature_access_flags: Object.fromEntries(featureAccessOptions.map((option) => [option.key, false])),
  extra_feature_access: {}
};

function normalizeFeatureLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findBenefitOptionId(featureLabel) {
  const normalized = normalizeFeatureLabel(featureLabel);

  const match = planBenefitOptions.find((option) =>
    option.aliases.some((alias) => normalizeFeatureLabel(alias) === normalized)
  );

  return match?.id || null;
}

function planToForm(plan) {
  const planFeatures = Array.isArray(plan?.features) ? plan.features : [];
  const selectedFeatureIds = [];
  const customFeatures = [];

  planFeatures.forEach((feature) => {
    const featureId = findBenefitOptionId(feature);

    if (featureId) {
      if (!selectedFeatureIds.includes(featureId)) {
        selectedFeatureIds.push(featureId);
      }
      return;
    }

    if (feature) {
      customFeatures.push(feature);
    }
  });

  const rawFeatureAccess = plan?.feature_access && typeof plan.feature_access === "object"
    ? plan.feature_access
    : {};

  const featureAccessFlags = Object.fromEntries(
    featureAccessOptions.map((option) => [option.key, Boolean(rawFeatureAccess?.[option.key])])
  );

  const extraFeatureAccess = Object.fromEntries(
    Object.entries(rawFeatureAccess).filter(([key]) => !featureAccessOptions.some((option) => option.key === key))
  );

  return {
    name: plan?.name || "",
    slug: plan?.slug || "",
    description: plan?.description || "",
    price: plan?.price == null ? "" : String(plan.price),
    billing_cycle: plan?.billing_cycle || "monthly",
    is_active: plan?.is_active === false ? "false" : "true",
    is_free: plan?.is_free ? "true" : "false",
    product_limit: plan?.product_limit == null ? "" : String(plan.product_limit),
    sort_order: plan?.sort_order == null ? "0" : String(plan.sort_order),
    selected_feature_ids: selectedFeatureIds,
    custom_features: customFeatures.join("\n"),
    feature_access_flags: featureAccessFlags,
    extra_feature_access: extraFeatureAccess
  };
}

function formatPrice(plan) {
  if (plan?.is_free) {
    return "Free";
  }

  const price = Number(plan?.price || 0);
  const cycle = plan?.billing_cycle === "yearly" ? "year" : "month";
  return `${price.toLocaleString()} TZS / ${cycle}`;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, tone: "info", message: "" });

  const planRows = useMemo(() => Array.isArray(plans) ? plans : [], [plans]);

  useEffect(() => {
    void loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const response = await superApi.listSubscriptionPlans();
      setPlans(Array.isArray(response?.plans) ? response.plans : []);
    } catch (e) {
      setPlans([]);
      setToast({ open: true, tone: "danger", message: e?.response?.data?.message || "Failed to load subscription plans." });
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleFeature(featureId) {
    setForm((current) => {
      const hasFeature = current.selected_feature_ids.includes(featureId);

      return {
        ...current,
        selected_feature_ids: hasFeature
          ? current.selected_feature_ids.filter((id) => id !== featureId)
          : [...current.selected_feature_ids, featureId]
      };
    });
  }

  function toggleFeatureAccess(featureKey) {
    setForm((current) => ({
      ...current,
      feature_access_flags: {
        ...current.feature_access_flags,
        [featureKey]: !current.feature_access_flags?.[featureKey]
      }
    }));
  }

  function resetForm() {
    setForm(defaultForm);
    setEditingPlanId(null);
  }

  function startEdit(plan) {
    setEditingPlanId(plan.id);
    setForm(planToForm(plan));
  }

  function buildPayload() {
    const selectedBenefitLabels = planBenefitOptions
      .filter((option) => form.selected_feature_ids.includes(option.id))
      .map((option) => option.label);

    const customFeatures = form.custom_features
      .split(/\n|,/)
      .map((feature) => feature.trim())
      .filter(Boolean);

    const featureAccess = {
      ...(form.extra_feature_access || {}),
      ...Object.fromEntries(
        featureAccessOptions.map((option) => [option.key, Boolean(form.feature_access_flags?.[option.key])])
      )
    };

    return {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      price: Number(form.price || 0),
      billing_cycle: form.billing_cycle,
      is_active: form.is_active === "true",
      is_free: form.is_free === "true",
      product_limit: form.product_limit.trim() ? Number(form.product_limit) : null,
      sort_order: Number(form.sort_order || 0),
      features: [...selectedBenefitLabels, ...customFeatures],
      feature_access: featureAccess
    };
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();

      if (editingPlanId) {
        await superApi.updateSubscriptionPlan(editingPlanId, payload);
      } else {
        await superApi.saveSubscriptionPlan(payload);
      }

      setToast({ open: true, tone: "success", message: editingPlanId ? "Subscription plan updated." : "Subscription plan created." });
      resetForm();
      await loadPlans();
    } catch (e) {
      const message = e?.response?.data?.message || "Failed to save plan.";
      setToast({ open: true, tone: "danger", message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-lg">
      <PageHeader
        title="Subscription Plans"
        subtitle="Edit subscription prices, catalog limits, and seller plan details from the admin workspace."
        right={<Button variant="secondary" onClick={loadPlans} loading={loading}>Refresh</Button>}
      />

      <Card
        title={editingPlanId ? "Edit Plan" : "Create Plan"}
        subtitle="Super admin plan management"
      >
        <form className="stack gap-md" onSubmit={save}>
          <div className="grid2">
            <Input label="Name" placeholder="e.g. Pro Vendor" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            <Input label="Slug" placeholder="e.g. pro-vendor" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} />
            <Input label="Price (TZS)" type="number" min="0" placeholder="e.g. 20000" value={form.price} onChange={(e) => updateField("price", e.target.value)} required />
            <Select label="Billing cycle" value={form.billing_cycle} onChange={(e) => updateField("billing_cycle", e.target.value)}>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </Select>
            <Select label="Free plan" value={form.is_free} onChange={(e) => updateField("is_free", e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Select>
            <Select label="Active" value={form.is_active} onChange={(e) => updateField("is_active", e.target.value)}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
            <Input label="Product limit" type="number" min="1" placeholder="Leave blank for unlimited" value={form.product_limit} onChange={(e) => updateField("product_limit", e.target.value)} />
            <Input label="Sort order" type="number" min="0" value={form.sort_order} onChange={(e) => updateField("sort_order", e.target.value)} />
          </div>

          <Textarea label="Description" rows={4} placeholder="What this plan unlocks for a seller." value={form.description} onChange={(e) => updateField("description", e.target.value)} />

          <div className="field">
            <span className="field__label">Plan Benefits</span>
            <span className="field__hint">Pick the customer-facing benefits this subscription should show and communicate.</span>
            <div className="planFeatureGrid">
              {planBenefitOptions.map((option) => {
                const isSelected = form.selected_feature_ids.includes(option.id);

                return (
                  <label key={option.id} className={`planFeatureOption ${isSelected ? "planFeatureOption--active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFeature(option.id)}
                    />
                    <span className="planFeatureOption__content">
                      <span className="planFeatureOption__title">{option.label}</span>
                      <span className="planFeatureOption__description">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <Textarea
            label="Additional Benefits"
            rows={4}
            hint="Optional extra benefits, one per line, if this plan has something special not listed above."
            placeholder={"Seller onboarding support\nSeasonal promotion assistance"}
            value={form.custom_features}
            onChange={(e) => updateField("custom_features", e.target.value)}
          />

          <div className="field">
            <span className="field__label">Operational Access</span>
            <span className="field__hint">These switches control which extra tools and support lanes the vendor gets.</span>
            <div className="planFeatureGrid">
              {featureAccessOptions.map((option) => {
                const isSelected = Boolean(form.feature_access_flags?.[option.key]);

                return (
                  <label key={option.key} className={`planFeatureOption ${isSelected ? "planFeatureOption--active" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleFeatureAccess(option.key)}
                    />
                    <span className="planFeatureOption__content">
                      <span className="planFeatureOption__title">{option.label}</span>
                      <span className="planFeatureOption__description">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="row gap-sm" style={{ justifyContent: "flex-end" }}>
            {editingPlanId ? (
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel Edit</Button>
            ) : null}
            <Button type="submit" loading={saving}>
              {editingPlanId ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Existing Plans" subtitle="Available seller plans from GET /api/v1/admin/super/subscription-plans">
        {loading ? (
          <div className="muted">Loading subscription plans...</div>
        ) : (
          <Table
            columns={[
              {
                key: "name",
                header: "Plan",
                render: (row) => (
                  <div className="stack" style={{ gap: 4 }}>
                    <div style={{ fontWeight: 700 }}>{row.name}</div>
                    <div className="muted">{row.slug}</div>
                  </div>
                )
              },
              {
                key: "price",
                header: "Pricing",
                render: (row) => (
                  <div className="stack" style={{ gap: 4 }}>
                    <div>{formatPrice(row)}</div>
                    <div className="muted">{row.product_limit ? `${row.product_limit} products` : "Unlimited catalog"}</div>
                  </div>
                )
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <div className="stack" style={{ gap: 6 }}>
                    <Badge tone={row.is_active ? "success" : "warning"}>{row.is_active ? "Active" : "Inactive"}</Badge>
                    <Badge tone={row.is_free ? "primary" : "neutral"}>{row.is_free ? "Free" : "Paid"}</Badge>
                  </div>
                )
              },
              {
                key: "features",
                header: "Features",
                render: (row) => (
                  <div className="stack" style={{ gap: 4, maxWidth: 320 }}>
                    {(Array.isArray(row.features) && row.features.length > 0
                      ? row.features
                      : [row.description || "No features listed."]
                    ).slice(0, 3).map((feature) => (
                      <div key={feature} className="muted">{feature}</div>
                    ))}
                  </div>
                )
              },
              {
                key: "actions",
                header: "Actions",
                render: (row) => (
                    <Button variant="secondary" size="sm" onClick={() => startEdit(row)}>
                      Edit Price & Details
                    </Button>
                )
              }
            ]}
            rows={planRows}
            emptyText="No subscription plans found."
          />
        )}
      </Card>

      <Toast open={toast.open} tone={toast.tone} message={toast.message} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </div>
  );
}
