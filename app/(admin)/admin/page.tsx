import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: productCount },
    { count: orderCount },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, status, total_cents, created_at, event_date_start")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Products", value: productCount || 0 },
    { label: "Total Orders", value: orderCount || 0 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome back, Lolita</h1>
        <p className="mt-1 text-gray-500">Here&apos;s how your business is doing today.</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-6">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Recent Orders</h2>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Event Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders?.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm">{o.id.slice(0, 8)}...</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.status === "paid" ? "bg-green-100 text-green-700" :
                    o.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {o.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">{o.event_date_start}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">{formatCents(o.total_cents)}</td>
              </tr>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
