"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  total_spent_cents: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "spent" | "recent">("name");
  const supabase = createClient();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  const fetchCustomers = useCallback(async () => {
    let query = supabase.from("customers").select("*");

    switch (sortBy) {
      case "spent":
        query = query.order("total_spent_cents", { ascending: false });
        break;
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      default:
        query = query.order("last_name").order("first_name");
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load customers");
      return;
    }
    setCustomers(data || []);
  }, [sortBy]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSelect = (customer: Customer) => {
    setSelected(customer);
  };

  const openCreate = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    });
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    setForm({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      notes: customer.notes || "",
    });
    setSelected(customer);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First and last name are required");
      return;
    }

    if (selected) {
      // Update
      const { error } = await supabase
        .from("customers")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email || null,
          phone: form.phone || null,
          company: form.company || null,
          notes: form.notes || null,
        })
        .eq("id", selected.id);

      if (error) {
        toast.error("Failed to update customer");
        return;
      }
      toast.success("Customer updated");
    } else {
      // Create
      const { error } = await supabase.from("customers").insert({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email || null,
        phone: form.phone || null,
        company: form.company || null,
        notes: form.notes || null,
        total_spent_cents: 0,
      });

      if (error) {
        toast.error("Failed to create customer");
        return;
      }
      toast.success("Customer created");
    }

    setShowModal(false);
    fetchCustomers();
    setSelected(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;

    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Customer deleted");
    setSelected(null);
    fetchCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const q = searchQuery.toLowerCase();
    return (
      fullName.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent_cents, 0);
  const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="mt-1 text-2xl font-bold">{totalCustomers}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold">{formatCents(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-500">Avg. Lifetime Value</p>
          <p className="mt-1 text-2xl font-bold">{formatCents(avgSpent)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="spent">Sort by Lifetime Value</option>
          <option value="recent">Sort by Most Recent</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Company
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">
                  Total Spent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selected?.id === c.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                        {c.first_name[0]}
                        {c.last_name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {c.first_name} {c.last_name}
                        </div>
                        {c.email && (
                          <div className="text-xs text-gray-500">{c.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.company || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCents(c.total_spent_cents)}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail sidebar */}
        {selected && !showModal && (
          <div className="w-80 shrink-0 rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-medium text-indigo-600">
                {selected.first_name[0]}
                {selected.last_name[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  {selected.first_name} {selected.last_name}
                </h2>
                {selected.company && (
                  <p className="text-sm text-gray-500">{selected.company}</p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {selected.email && (
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {selected.email}
                  </a>
                </p>
              )}
              {selected.phone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <a
                    href={`tel:${selected.phone}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {selected.phone}
                  </a>
                </p>
              )}

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Lifetime Value</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCents(selected.total_spent_cents)}
                </p>
              </div>

              {selected.notes && (
                <div>
                  <span className="text-gray-500">Notes:</span>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {selected.notes}
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Customer since{" "}
                {new Date(selected.created_at).toLocaleDateString()}
              </p>

              <hr className="my-3" />
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Edit
                </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">
              {selected ? "Edit Customer" : "Add Customer"}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
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
                {selected ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
