"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";
import toast from "react-hot-toast";
import { format, addDays, isPast, isToday } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  order_id: string | null;
  proposal_id: string | null;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal_cents: number;
  tax_cents: number;
  discount_cents: number;
  total_cents: number;
  amount_paid_cents: number;
  notes: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  customers?: { first_name: string; last_name: string; email: string | null } | null;
}

interface InvoiceItem {
  id: string;
  invoice_id: string;
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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-yellow-100 text-yellow-700",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const [form, setForm] = useState({
    customer_id: "",
    issue_date: format(new Date(), "yyyy-MM-dd"),
    due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    notes: "",
    items: [{ description: "", qty: 1, unit_price_cents: 0 }] as {
      description: string;
      qty: number;
      unit_price_cents: number;
    }[],
  });

  const fetchInvoices = useCallback(async () => {
    let query = supabase
      .from("invoices")
      .select("*, customers(first_name, last_name, email)")
      .order("created_at", { ascending: false });

    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load invoices");
      return;
    }
    setInvoices(data || []);
  }, [filterStatus]);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, first_name, last_name, email")
      .order("last_name");
    setCustomers(data || []);
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [fetchInvoices, fetchCustomers]);

  const handleSelect = async (invoice: Invoice) => {
    setSelected(invoice);
    const { data } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id)
      .order("sort");
    setInvoiceItems(data || []);
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `INV-${year}${month}-${rand}`;
  };

  const openCreate = () => {
    setForm({
      customer_id: "",
      issue_date: format(new Date(), "yyyy-MM-dd"),
      due_date: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      notes: "",
      items: [{ description: "", qty: 1, unit_price_cents: 0 }],
    });
    setSelected(null);
    setShowModal(true);
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { description: "", qty: 1, unit_price_cents: 0 }],
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
    setForm({ ...form, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + item.qty * item.unit_price_cents,
      0
    );
    const tax = Math.round(subtotal * 0.0825); // 8.25% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSave = async () => {
    if (!form.customer_id) {
      toast.error("Please select a customer");
      return;
    }
    if (form.items.every((i) => !i.description.trim())) {
      toast.error("Add at least one line item");
      return;
    }

    const { subtotal, tax, total } = calculateTotals();

    // Create invoice
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: generateInvoiceNumber(),
        customer_id: form.customer_id,
        status: "draft",
        issue_date: form.issue_date,
        due_date: form.due_date,
        subtotal_cents: subtotal,
        tax_cents: tax,
        discount_cents: 0,
        total_cents: total,
        amount_paid_cents: 0,
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (invErr || !invoice) {
      toast.error("Failed to create invoice");
      return;
    }

    // Create items
    const items = form.items
      .filter((i) => i.description.trim())
      .map((item, idx) => ({
        invoice_id: invoice.id,
        description: item.description,
        qty: item.qty,
        unit_price_cents: item.unit_price_cents,
        line_total_cents: item.qty * item.unit_price_cents,
        sort: idx,
      }));

    if (items.length > 0) {
      const { error: itemsErr } = await supabase
        .from("invoice_items")
        .insert(items);
      if (itemsErr) {
        toast.error("Failed to save line items");
      }
    }

    toast.success("Invoice created");
    setShowModal(false);
    fetchInvoices();
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === "sent") updates.sent_at = new Date().toISOString();
    if (status === "paid") {
      updates.paid_at = new Date().toISOString();
      if (selected) updates.amount_paid_cents = selected.total_cents;
    }

    const { error } = await supabase.from("invoices").update(updates).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Invoice marked as ${status}`);
    fetchInvoices();
    if (selected?.id === id) {
      setSelected({ ...selected, status, ...updates } as Invoice);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Invoice deleted");
    setSelected(null);
    fetchInvoices();
  };

  const getDisplayStatus = (invoice: Invoice) => {
    if (invoice.status === "sent" && isPast(new Date(invoice.due_date)) && !isToday(new Date(invoice.due_date))) {
      return "overdue";
    }
    return invoice.status;
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const customerName = inv.customers
      ? `${inv.customers.first_name} ${inv.customers.last_name}`.toLowerCase()
      : "";
    return (
      inv.invoice_number.toLowerCase().includes(q) ||
      customerName.includes(q)
    );
  });

  // Stats
  const totalOutstanding = invoices
    .filter((i) => ["sent", "viewed"].includes(i.status) || (i.status === "sent" && isPast(new Date(i.due_date))))
    .reduce((sum, i) => sum + (i.total_cents - i.amount_paid_cents), 0);
  const totalOverdue = invoices
    .filter((i) => i.status === "sent" && isPast(new Date(i.due_date)))
    .reduce((sum, i) => sum + (i.total_cents - i.amount_paid_cents), 0);
  const paidThisMonth = invoices
    .filter((i) => i.status === "paid" && i.paid_at && new Date(i.paid_at).getMonth() === new Date().getMonth())
    .reduce((sum, i) => sum + i.amount_paid_cents, 0);

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="mt-1 text-2xl font-bold">{formatCents(totalOutstanding)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatCents(totalOverdue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Paid This Month</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{formatCents(paidThisMonth)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search invoices..."
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
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Invoice
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Due Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((inv) => {
                const displayStatus = getDisplayStatus(inv);
                return (
                  <tr
                    key={inv.id}
                    onClick={() => handleSelect(inv)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selected?.id === inv.id ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {inv.customers
                        ? `${inv.customers.first_name} ${inv.customers.last_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[displayStatus] || STATUS_COLORS.draft
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {inv.due_date}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCents(inv.total_cents)}
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No invoices found
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
              <h2 className="text-lg font-bold">{selected.invoice_number}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  STATUS_COLORS[getDisplayStatus(selected)]
                }`}
              >
                {getDisplayStatus(selected)}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <p>
                <span className="text-gray-500">Customer:</span>{" "}
                {selected.customers
                  ? `${selected.customers.first_name} ${selected.customers.last_name}`
                  : "—"}
              </p>
              <p>
                <span className="text-gray-500">Issue Date:</span>{" "}
                {selected.issue_date}
              </p>
              <p>
                <span className="text-gray-500">Due Date:</span>{" "}
                {selected.due_date}
              </p>

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
                  <button
                    onClick={() => handleStatusUpdate(selected.id, "paid")}
                    className="rounded border bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100"
                  >
                    Mark as Paid
                  </button>
                )}
                {!["paid", "cancelled", "refunded"].includes(selected.status) && (
                  <button
                    onClick={() => handleStatusUpdate(selected.id, "cancelled")}
                    className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <hr />
              <h3 className="font-semibold">Line Items</h3>
              {invoiceItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.description} &times; {item.qty}
                  </span>
                  <span className="font-medium">
                    {formatCents(item.line_total_cents)}
                  </span>
                </div>
              ))}
              {invoiceItems.length === 0 && (
                <p className="text-gray-400">No items</p>
              )}

              <hr />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCents(selected.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCents(selected.tax_cents)}</span>
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
                {selected.amount_paid_cents > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>{formatCents(selected.amount_paid_cents)}</span>
                  </div>
                )}
                {selected.total_cents - selected.amount_paid_cents > 0 &&
                  selected.status !== "cancelled" && (
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Balance Due</span>
                      <span>
                        {formatCents(
                          selected.total_cents - selected.amount_paid_cents
                        )}
                      </span>
                    </div>
                  )}
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
            <h2 className="mb-4 text-lg font-bold">New Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Customer *
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
                      {c.email ? ` (${c.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) =>
                      setForm({ ...form, issue_date: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) =>
                      setForm({ ...form, due_date: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Line Items
                </label>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
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
                        className="w-28 rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                      <span className="flex w-24 items-center justify-end text-sm font-medium">
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
                  + Add line item
                </button>
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCents(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8.25%)</span>
                  <span>{formatCents(tax)}</span>
                </div>
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
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
