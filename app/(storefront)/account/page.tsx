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
  pending_payment: "bg-amber-50 text-amber-700",
  paid: "bg-green-50 text-green-700",
  scheduled: "bg-blue-50 text-blue-700",
  out_for_delivery: "bg-purple-50 text-purple-700",
  completed: "bg-ivory-dark text-warm-gray",
  cancelled: "bg-red-50 text-red-600",
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
      <div className="px-6 py-20 text-center">
        <h1 className="font-heading text-3xl font-light text-charcoal">My Account</h1>
        <p className="mt-3 font-body text-sm text-warm-gray">Please sign in to view your account.</p>
        <Link
          href="/login?redirect=/account"
          className="mt-5 inline-block bg-champagne px-8 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 font-heading text-3xl font-light text-charcoal">My Account</h1>

      {/* Profile Section */}
      <section className="mb-8 border border-ivory-dark bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-normal text-charcoal">Profile</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="font-body text-sm font-medium text-champagne hover:text-champagne-dark"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-ivory-dark px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveProfile}
                className="bg-champagne px-5 py-2.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-champagne-dark"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setFullName(profile?.full_name || ""); setPhone(profile?.phone || ""); }}
                className="border border-ivory-dark px-5 py-2.5 font-body text-sm text-charcoal-light transition-colors hover:border-champagne"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Email</p>
              <p className="mt-1 font-body text-sm font-medium text-charcoal">{user.email}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Full Name</p>
              <p className="mt-1 font-body text-sm font-medium text-charcoal">{profile?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="font-body text-xs uppercase tracking-wider text-warm-gray">Phone</p>
              <p className="mt-1 font-body text-sm font-medium text-charcoal">{profile?.phone || "Not set"}</p>
            </div>
          </div>
        )}
      </section>

      {/* Orders Section */}
      <section className="border border-ivory-dark bg-white p-6">
        <h2 className="mb-4 font-heading text-xl font-normal text-charcoal">My Orders</h2>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-body text-sm text-warm-gray">No orders yet.</p>
            <Link
              href="/products"
              className="mt-3 inline-block font-body text-sm font-medium text-champagne hover:text-champagne-dark"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between border border-ivory-dark p-4 transition-colors hover:bg-ivory"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-charcoal-light">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || "bg-ivory-dark"}`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm text-warm-gray">
                    {order.event_date_start} &rarr; {order.event_date_end}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-body font-medium text-charcoal">{formatCents(order.total_cents)}</p>
                  <p className="font-body text-xs text-warm-gray-light">
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
