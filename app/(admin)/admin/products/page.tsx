"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string | null;
  pricing_model: string;
  base_price_cents: number;
  security_deposit_cents: number;
  total_qty: number;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  category_id: "",
  pricing_model: "per_day",
  base_price_cents: 0,
  security_deposit_cents: 0,
  total_qty: 0,
  active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts(data || []);
  }, []);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!editing?.name) {
      toast.error("Name is required");
      return;
    }

    const payload = {
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description || "",
      category_id: editing.category_id || null,
      pricing_model: editing.pricing_model || "per_day",
      base_price_cents: Number(editing.base_price_cents) || 0,
      security_deposit_cents: Number(editing.security_deposit_cents) || 0,
      total_qty: Number(editing.total_qty) || 0,
      active: editing.active ?? true,
    };

    let productId = editing.id;

    if (isNew) {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) {
        toast.error(error.message);
        return;
      }
      productId = data.id;
      toast.success("Product created");
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id!);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Product updated");
    }

    // Upload image if selected
    if (imageFile && productId) {
      const ext = imageFile.name.split(".").pop();
      const path = `${productId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile, { upsert: true });

      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        await supabase.from("product_images").insert({
          product_id: productId,
          url: publicUrl,
          sort: 0,
        });
        toast.success("Image uploaded");
      }
      setImageFile(null);
    }

    setEditing(null);
    setIsNew(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={() => { setEditing({ ...emptyProduct }); setIsNew(true); }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Product
        </button>
      </div>

      {/* Product list */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Price</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Model</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Active</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                <td className="px-4 py-3 text-sm">{formatCents(p.base_price_cents)}</td>
                <td className="px-4 py-3 text-sm">{p.total_qty}</td>
                <td className="px-4 py-3 text-sm">{p.pricing_model}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${p.active ? "bg-green-500" : "bg-gray-300"}`} />
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => { setEditing({ ...p }); setIsNew(false); }}
                    className="mr-2 text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">{isNew ? "Add Product" : "Edit Product"}</h2>
            <div className="space-y-3">
              <input
                placeholder="Product name"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                placeholder="Slug"
                value={editing.slug || ""}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Description"
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={3}
              />
              <select
                value={editing.category_id || ""}
                onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Price (cents)</label>
                  <input
                    type="number"
                    value={editing.base_price_cents || 0}
                    onChange={(e) => setEditing({ ...editing, base_price_cents: Number(e.target.value) })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Deposit (cents)</label>
                  <input
                    type="number"
                    value={editing.security_deposit_cents || 0}
                    onChange={(e) => setEditing({ ...editing, security_deposit_cents: Number(e.target.value) })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Total Qty</label>
                  <input
                    type="number"
                    value={editing.total_qty || 0}
                    onChange={(e) => setEditing({ ...editing, total_qty: Number(e.target.value) })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Pricing Model</label>
                  <select
                    value={editing.pricing_model || "per_day"}
                    onChange={(e) => setEditing({ ...editing, pricing_model: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="per_day">Per Day</option>
                    <option value="flat">Flat Rate</option>
                    <option value="weekend">Weekend</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded"
                />
                Active
              </label>
              <div>
                <label className="text-xs text-gray-500">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
