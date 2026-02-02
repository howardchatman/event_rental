"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminChatBot from "@/components/AdminChatBot";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "🧾" },
  { href: "/admin/calendar", label: "Calendar", icon: "📅" },
  { href: "/admin/appointments", label: "Appointments", icon: "🤝" },
  { href: "/admin/leads", label: "Sales Leads", icon: "💼" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="text-xl font-bold text-indigo-600">
            Admin
          </Link>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t p-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
            &larr; Back to Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>

      {/* Chat Bot */}
      <AdminChatBot />
    </div>
  );
}
