"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: "florist", label: "Florist" },
  { value: "caterer", label: "Caterer" },
  { value: "photographer", label: "Photographer" },
  { value: "dj", label: "DJ / Entertainment" },
  { value: "planner", label: "Event Planner" },
  { value: "rental_partner", label: "Rental Partner" },
  { value: "transport", label: "Transport / Delivery" },
  { value: "staffing", label: "Staffing" },
  { value: "other", label: "Other" },
];

const categoryColors: Record<string, string> = {
  florist: "bg-pink-100 text-pink-700",
  caterer: "bg-orange-100 text-orange-700",
  photographer: "bg-purple-100 text-purple-700",
  dj: "bg-blue-100 text-blue-700",
  planner: "bg-green-100 text-green-700",
  rental_partner: "bg-yellow-100 text-yellow-700",
  transport: "bg-cyan-100 text-cyan-700",
  staffing: "bg-indigo-100 text-indigo-700",
  other: "bg-gray-100 text-gray-700",
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    category: "other",
    contact_name: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
    active: true,
  });

  const fetchVendors = useCallback(async () => {
    let query = supabase
      .from("vendors")
      .select("*")
      .order("name");

    if (filterCategory) {
      query = query.eq("category", filterCategory);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load vendors");
      return;
    }
    setVendors(data || []);
  }, [filterCategory]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleSelect = (vendor: Vendor) => {
    setSelected(vendor);
  };

  const openCreate = () => {
    setForm({
      name: "",
      category: "other",
      contact_name: "",
      email: "",
      phone: "",
      website: "",
      notes: "",
      active: true,
    });
    setSelected(null);
    setShowModal(true);
  };

  const openEdit = (vendor: Vendor) => {
    setForm({
      name: vendor.name,
      category: vendor.category,
      contact_name: vendor.contact_name || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      website: vendor.website || "",
      notes: vendor.notes || "",
      active: vendor.active,
    });
    setSelected(vendor);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vendor name is required");
      return;
    }

    if (selected) {
      // Update
      const { error } = await supabase
        .from("vendors")
        .update({
          name: form.name,
          category: form.category,
          contact_name: form.contact_name || null,
          email: form.email || null,
          phone: form.phone || null,
          website: form.website || null,
          notes: form.notes || null,
          active: form.active,
        })
        .eq("id", selected.id);

      if (error) {
        toast.error("Failed to update vendor");
        return;
      }
      toast.success("Vendor updated");
    } else {
      // Create
      const { error } = await supabase.from("vendors").insert({
        name: form.name,
        category: form.category,
        contact_name: form.contact_name || null,
        email: form.email || null,
        phone: form.phone || null,
        website: form.website || null,
        notes: form.notes || null,
        active: form.active,
      });

      if (error) {
        toast.error("Failed to create vendor");
        return;
      }
      toast.success("Vendor created");
    }

    setShowModal(false);
    fetchVendors();
    setSelected(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;

    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Vendor deleted");
    setSelected(null);
    fetchVendors();
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVendors.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => handleSelect(v)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selected?.id === v.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{v.name}</div>
                    {v.email && (
                      <div className="text-xs text-gray-500">{v.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        categoryColors[v.category] || categoryColors.other
                      }`}
                    >
                      {CATEGORIES.find((c) => c.value === v.category)?.label ||
                        v.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {v.contact_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {v.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredVendors.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail sidebar */}
        {selected && !showModal && (
          <div className="w-80 shrink-0 rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">{selected.name}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>{" "}
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    categoryColors[selected.category]
                  }`}
                >
                  {CATEGORIES.find((c) => c.value === selected.category)
                    ?.label || selected.category}
                </span>
              </div>
              {selected.contact_name && (
                <p>
                  <span className="text-gray-500">Contact:</span>{" "}
                  {selected.contact_name}
                </p>
              )}
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
              {selected.website && (
                <p>
                  <span className="text-gray-500">Website:</span>{" "}
                  <a
                    href={selected.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {selected.website}
                  </a>
                </p>
              )}
              {selected.notes && (
                <div>
                  <span className="text-gray-500">Notes:</span>
                  <p className="mt-1 whitespace-pre-wrap text-gray-700">
                    {selected.notes}
                  </p>
                </div>
              )}
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
              {selected ? "Edit Vendor" : "Add Vendor"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  placeholder="https://"
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Active vendor</span>
              </label>
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
                {selected ? "Save Changes" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
