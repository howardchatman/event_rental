"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";
import toast from "react-hot-toast";
import { format, addDays } from "date-fns";

interface Proposal {
  id: string;
  customer_id: string | null;
  title: string;
  status: string;
  event_date: string | null;
  event_type: string | null;
  venue: string | null;
  guest_count: number | null;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  notes: string | null;
  valid_until: string | null;
  sent_at: string | null;
  created_at: string;
  customers?: { first_name: string; last_name: string; email: string | null } | null;
}

interface ProposalItem {
  id: string;
  proposal_id: string;
  product_id: string | null;
  description: string;
  qty: number;
  unit_price_cents: number;
  line_total_cents: number;
  sort: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

interface Product {
  id: string;
  name: string;
  base_price_cents: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-yellow-100 text-yellow-700",
};

const EVENT_TYPES = [
  "Wedding",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Graduation",
  "Baby Shower",
  "Bridal Shower",
  "Quinceañera",
  "Holiday Party",
  "Other",
];

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const [form, setForm] = useState({
    customer_id: "",
    title: "",
    event_date: "",
    event_type: "",
    venue: "",
    guest_count: "",
    valid_until: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    notes: "",
    discount_cents: 0,
    items: [{ product_id: "", description: "", qty: 1, unit_price_cents: 0 }] as {
      product_id: string;
      description: string;
      qty: number;
      unit_price_cents: number;
    }[],
  });

  const fetchProposals = useCallback(async () => {
    let query = supabase
      .from("proposals")
      .select("*, customers(first_name, last_name, email)")
      .order("created_at", { ascending: false });

    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load proposals");
      return;
    }
    setProposals(data || []);
  }, [filterStatus]);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email")
      .order("last_name");
    setCustomers(data || []);
  }, []);

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, base_price_cents")
      .eq("active", true)
      .order("name");
    setProducts(data || []);
  }, []);

  useEffect(() => {
    fetchProposals();
    fetchCustomers();
    fetchProducts();
  }, [fetchProposals, fetchCustomers, fetchProducts]);

  const handleSelect = async (proposal: Proposal) => {
    setSelected(proposal);
    const { data } = await supabase
      .from("proposal_items")
      .select("*")
      .eq("proposal_id", proposal.id)
      .order("sort");
    setProposalItems(data || []);
  };

  const openCreate = () => {
    setForm({
      customer_id: "",
      title: "",
      event_date: "",
      event_type: "",
      venue: "",
      guest_count: "",
      valid_until: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      notes: "",
      discount_cents: 0,
      items: [{ product_id: "", description: "", qty: 1, unit_price_cents: 0 }],
    });
    setSelected(null);
    setShowModal(true);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { product_id: "", description: "", qty: 1, unit_price_cents: 0 },
      ],
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (
    index: number,
    field: keyof (typeof form.items)[0],
    value: string | number
  ) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill from product selection
    if (field === "product_id" && value) {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].description = product.name;
        newItems[index].unit_price_cents = product.base_price_cents;
      }
    }

    setForm({ ...form, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + item.qty * item.unit_price_cents,
      0
    );
    const total = subtotal - form.discount_cents;
    return { subtotal, total: total > 0 ? total : 0 };
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Proposal title is required");
      return;
    }
    if (form.items.every((i) => !i.description.trim())) {
      toast.error("Add at least one line item");
      return;
    }

    const { subtotal, total } = calculateTotals();

    // Create proposal
    const { data: proposal, error: propErr } = await supabase
      .from("proposals")
      .insert({
        customer_id: form.customer_id || null,
        title: form.title,
        status: "draft",
        event_date: form.event_date || null,
        event_type: form.event_type || null,
        venue: form.venue || null,
        guest_count: form.guest_count ? parseInt(form.guest_count) : null,
        subtotal_cents: subtotal,
        discount_cents: form.discount_cents,
        total_cents: total,
        notes: form.notes || null,
        valid_until: form.valid_until || null,
      })
      .select("id")
      .single();

    if (propErr || !proposal) {
      toast.error("Failed to create proposal");
      return;
    }

    // Create items
    const items = form.items
      .filter((i) => i.description.trim())
      .map((item, idx) => ({
        proposal_id: proposal.id,
        product_id: item.product_id || null,
        description: item.description,
        qty: item.qty,
        unit_price_cents: item.unit_price_cents,
        line_total_cents: item.qty * item.unit_price_cents,
        sort: idx,
      }));

    if (items.length > 0) {
      const { error: itemsErr } = await supabase
        .from("proposal_items")
        .insert(items);
      if (itemsErr) {
        toast.error("Failed to save line items");
      }
    }

    toast.success("Proposal created");
    setShowModal(false);
    fetchProposals();
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "sent") updates.sent_at = new Date().toISOString();

    const { error } = await supabase
      .from("proposals")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Proposal marked as ${status}`);
    fetchProposals();
    if (selected?.id === id) {
      setSelected({ ...selected, status, ...updates } as Proposal);
    }
  };

  const convertToInvoice = async (proposal: Proposal) => {
    if (!proposal.customer_id) {
      toast.error("Proposal needs a customer to create an invoice");
      return;
    }

    // Generate invoice number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const invoiceNumber = `INV-${year}${month}-${rand}`;

    const tax = Math.round(proposal.subtotal_cents * 0.0825);

    // Create invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        customer_id: proposal.customer_id,
        proposal_id: proposal.id,
        status: "draft",
        issue_date: format(new Date(), "yyyy-MM-dd"),
        due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
        subtotal_cents: proposal.subtotal_cents,
        tax_cents: tax,
        discount_cents: proposal.discount_cents,
        total_cents: proposal.total_cents + tax,
        amount_paid_cents: 0,
      })
      .select("id")
      .single();

    if (invErr || !invoice) {
      toast.error("Failed to create invoice");
      return;
    }

    // Copy items
    const itemsToInsert = proposalItems.map((item, idx) => ({
      invoice_id: invoice.id,
      description: item.description,
      qty: item.qty,
      unit_price_cents: item.unit_price_cents,
      line_total_cents: item.line_total_cents,
      sort: idx,
    }));

    if (itemsToInsert.length > 0) {
      await supabase.from("invoice_items").insert(itemsToInsert);
    }

    // Update proposal status to accepted
    await supabase
      .from("proposals")
      .update({ status: "accepted" })
      .eq("id", proposal.id);

    toast.success("Invoice created from proposal");
    fetchProposals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    const { error } = await supabase.from("proposals").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Proposal deleted");
    setSelected(null);
    fetchProposals();
  };

  const filteredProposals = proposals.filter((p) => {
    const q = searchQuery.toLowerCase();
    const customerName = p.customers
      ? `${p.customers.first_name} ${p.customers.last_name}`.toLowerCase()
      : "";
    return p.title.toLowerCase().includes(q) || customerName.includes(q);
  });

  // Stats
  const pendingValue = proposals
    .filter((p) => ["draft", "sent", "viewed"].includes(p.status))
    .reduce((sum, p) => sum + p.total_cents, 0);
  const acceptedValue = proposals
    .filter((p) => p.status === "accepted")
    .reduce((sum, p) => sum + p.total_cents, 0);
  const conversionRate =
    proposals.length > 0
      ? Math.round(
          (proposals.filter((p) => p.status === "accepted").length /
            proposals.length) *
            100
        )
      : 0;

  const { subtotal, total } = calculateTotals();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Proposals</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Proposal
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Pipeline Value</p>
          <p className="mt-1 text-2xl font-bold">{formatCents(pendingValue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Accepted Value</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatCents(acceptedValue)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="mt-1 text-2xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search proposals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Proposal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Event Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProposals.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selected?.id === p.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    {p.event_type && (
                      <div className="text-xs text-gray-500">{p.event_type}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {p.customers
                      ? `${p.customers.first_name} ${p.customers.last_name}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.event_date || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[p.status] || STATUS_COLORS.draft
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCents(p.total_cents)}
                  </td>
                </tr>
              ))}
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No proposals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail sidebar */}
        {selected && !showModal && (
          <div className="w-96 shrink-0 rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{selected.title}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[selected.status]
                }`}
              >
                {selected.status}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="text-gray-500">Customer:</span>{" "}
                {selected.customers
                  ? `${selected.customers.first_name} ${selected.customers.last_name}`
                  : "—"}
              </p>
              {selected.event_date && (
                <p>
                  <span className="text-gray-500">Event Date:</span>{" "}
                  {selected.event_date}
                </p>
              )}
              {selected.event_type && (
                <p>
                  <span className="text-gray-500">Event Type:</span>{" "}
                  {selected.event_type}
                </p>
              )}
              {selected.venue && (
                <p>
                  <span className="text-gray-500">Venue:</span> {selected.venue}
                </p>
              )}
              {selected.guest_count && (
                <p>
                  <span className="text-gray-500">Guests:</span>{" "}
                  {selected.guest_count}
                </p>
              )}
              {selected.valid_until && (
                <p>
                  <span className="text-gray-500">Valid Until:</span>{" "}
                  {selected.valid_until}
                </p>
              )}

              {/* Status actions */}
              <div className="flex flex-wrap gap-2">
                {selected.status === "draft" && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, "sent")}
                    className="rounded border bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    Mark as Sent
                  </button>
                )}
                {["sent", "viewed"].includes(selected.status) && (
                  <>
                    <button
                      onClick={() => convertToInvoice(selected)}
                      className="rounded border bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                    >
                      Accept & Create Invoice
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selected.id, "declined")}
                      className="rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Declined
                    </button>
                  </>
                )}
              </div>

              <hr />
              <h3 className="font-semibold">Items</h3>
              {proposalItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.description} &times; {item.qty}
                  </span>
                  <span className="font-medium">
                    {formatCents(item.line_total_cents)}
                  </span>
                </div>
              ))}
              {proposalItems.length === 0 && (
                <p className="text-gray-400">No items</p>
              )}

              <hr />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCents(selected.subtotal_cents)}</span>
                </div>
                {selected.discount_cents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-green-600">
                      -{formatCents(selected.discount_cents)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCents(selected.total_cents)}</span>
                </div>
              </div>

              {selected.notes && (
                <>
                  <hr />
                  <div>
                    <span className="text-gray-500">Notes:</span>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700">
                      {selected.notes}
                    </p>
                  </div>
                </>
              )}

              <hr />
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">New Proposal</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Proposal Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Smith Wedding Reception"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <select
                    value={form.customer_id}
                    onChange={(e) =>
                      setForm({ ...form, customer_id: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Event Type
                  </label>
                  <select
                    value={form.event_type}
                    onChange={(e) =>
                      setForm({ ...form, event_type: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select type...</option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm({ ...form, event_date: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={form.guest_count}
                    onChange={(e) =>
                      setForm({ ...form, guest_count: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) =>
                      setForm({ ...form, valid_until: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Venue
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  placeholder="Venue name and address"
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Line items */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Items
                </label>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(idx, "product_id", e.target.value)
                        }
                        className="w-40 rounded-lg border px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Custom...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                        className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(idx, "qty", parseInt(e.target.value) || 1)
                        }
                        className="w-16 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Price (cents)"
                        value={item.unit_price_cents}
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "unit_price_cents",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="flex w-20 items-center justify-end text-sm font-medium">
                        {formatCents(item.qty * item.unit_price_cents)}
                      </span>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-2 text-sm text-indigo-600 hover:underline"
                >
                  + Add item
                </button>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Discount (cents)
                  </label>
                  <input
                    type="number"
                    value={form.discount_cents}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_cents: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCents(subtotal)}</span>
                </div>
                {form.discount_cents > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatCents(form.discount_cents)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>{formatCents(total)}</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
