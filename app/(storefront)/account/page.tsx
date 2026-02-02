"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatCents } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface Order {
  id: string;
  status: string;
  event_date_start: string;
  event_date_end: string;
  total_cents: number;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  role: string;
}

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const [{ data: profileData }, { data: ordersData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("orders")
        .select("id, status, event_date_start, event_date_end, total_cents, created_at")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
      setPhone(profileData.phone || "");
    }
    setOrders(ordersData || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveProfile = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    setProfile({ ...profile!, full_name: fullName, phone });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="mt-3 text-gray-500">Please sign in to view your account.</p>
        <Link
          href="/login?redirect=/account"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>

      {/* Profile Section */}
      <section className="mb-8 rounded-xl border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setFullName(profile?.full_name || ""); setPhone(profile?.phone || ""); }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{profile?.phone || "Not set"}</p>
            </div>
          </div>
        )}
      </section>

      {/* Orders Section */}
      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-xl font-semibold">My Orders</h2>

        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No orders yet.</p>
            <Link
              href="/products"
              className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {order.event_date_start} &rarr; {order.event_date_end}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCents(order.total_cents)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
