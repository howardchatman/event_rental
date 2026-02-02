"use client";

import { useState } from "react";

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  type: "site_visit" | "consultation" | "delivery" | "pickup";
  date: string;
  time: string;
  duration: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes: string;
  linkedOrderId?: string;
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "apt-1", clientName: "Sarah Mitchell", clientEmail: "sarah@example.com", clientPhone: "(555) 123-4567", type: "site_visit", date: "2026-02-03", time: "10:00 AM", duration: "1 hour", status: "confirmed", notes: "Wedding venue walkthrough — 150 guests, outdoor ceremony" },
  { id: "apt-2", clientName: "Marcus Rivera", clientEmail: "marcus@example.com", clientPhone: "(555) 234-5678", type: "consultation", date: "2026-02-04", time: "2:00 PM", duration: "30 min", status: "scheduled", notes: "Corporate event planning — needs AV setup quote" },
  { id: "apt-3", clientName: "Emily Chen", clientEmail: "emily@example.com", clientPhone: "(555) 345-6789", type: "delivery", date: "2026-02-05", time: "9:00 AM", duration: "2 hours", status: "confirmed", notes: "Birthday party setup — 1 tent, 5 tables, 40 chairs", linkedOrderId: "ord-a1b2" },
  { id: "apt-4", clientName: "Tom Anderson", clientEmail: "tom@example.com", clientPhone: "(555) 456-7890", type: "pickup", date: "2026-02-06", time: "11:00 AM", duration: "1 hour", status: "scheduled", notes: "Post-event pickup — check items for damage" },
  { id: "apt-5", clientName: "Jessica Park", clientEmail: "jess@example.com", clientPhone: "(555) 567-8901", type: "site_visit", date: "2026-02-03", time: "3:00 PM", duration: "1 hour", status: "scheduled", notes: "Outdoor graduation party — needs tent recommendations" },
  { id: "apt-6", clientName: "David Wilson", clientEmail: "david@example.com", clientPhone: "(555) 678-9012", type: "consultation", date: "2026-02-07", time: "10:00 AM", duration: "45 min", status: "cancelled", notes: "Cancelled — rescheduling for next week" },
];

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  site_visit: { label: "Site Visit", icon: "📍", color: "bg-blue-100 text-blue-700" },
  consultation: { label: "Consultation", icon: "💬", color: "bg-purple-100 text-purple-700" },
  delivery: { label: "Delivery", icon: "🚚", color: "bg-green-100 text-green-700" },
  pickup: { label: "Pickup", icon: "📦", color: "bg-orange-100 text-orange-700" },
};

const statusLabels: Record<string, { color: string }> = {
  scheduled: { color: "bg-yellow-100 text-yellow-700" },
  confirmed: { color: "bg-green-100 text-green-700" },
  completed: { color: "bg-gray-100 text-gray-700" },
  cancelled: { color: "bg-red-100 text-red-700" },
  no_show: { color: "bg-red-200 text-red-800" },
};

const emptyAppointment: Omit<Appointment, "id"> = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  type: "consultation",
  date: "",
  time: "10:00 AM",
  duration: "30 min",
  status: "scheduled",
  notes: "",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Omit<Appointment, "id">>(emptyAppointment);
  const [view, setView] = useState<"list" | "today">("list");

  const todayStr = "2026-02-03";
  const todayAppointments = appointments.filter((a) => a.date === todayStr && a.status !== "cancelled");
  const upcomingAppointments = appointments
    .filter((a) => a.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const handleCreate = () => {
    if (!form.clientName || !form.date) return;
    const newApt: Appointment = {
      ...form,
      id: `apt-${Date.now()}`,
    };
    setAppointments([...appointments, newApt]);
    setIsCreating(false);
    setForm(emptyAppointment);
    setSelected(newApt);
  };

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm font-medium ${view === "list" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              All
            </button>
            <button
              onClick={() => setView("today")}
              className={`px-3 py-1.5 text-sm font-medium ${view === "today" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Today ({todayAppointments.length})
            </button>
          </div>
          <button
            onClick={() => { setIsCreating(true); setSelected(null); }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Today</p>
          <p className="mt-1 text-2xl font-bold">{todayAppointments.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">This Week</p>
          <p className="mt-1 text-2xl font-bold">{appointments.filter((a) => a.status !== "cancelled").length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{appointments.filter((a) => a.status === "confirmed").length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{appointments.filter((a) => a.status === "scheduled").length}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Appointment list */}
        <div className="flex-1 space-y-3">
          {(view === "today" ? todayAppointments : upcomingAppointments).map((apt) => (
            <div
              key={apt.id}
              onClick={() => { setSelected(apt); setIsCreating(false); }}
              className={`cursor-pointer rounded-xl border bg-white p-4 transition hover:shadow-md ${
                selected?.id === apt.id ? "border-indigo-500 ring-1 ring-indigo-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeLabels[apt.type]?.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{apt.clientName}</p>
                    <p className="text-sm text-gray-500">{apt.clientEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeLabels[apt.type]?.color}`}>
                    {typeLabels[apt.type]?.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusLabels[apt.status]?.color}`}>
                    {apt.status}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                <span>📅 {apt.date}</span>
                <span>🕐 {apt.time}</span>
                <span>⏱ {apt.duration}</span>
              </div>
              {apt.notes && (
                <p className="mt-2 text-sm text-gray-500">{apt.notes}</p>
              )}
            </div>
          ))}

          {(view === "today" ? todayAppointments : upcomingAppointments).length === 0 && (
            <p className="py-8 text-center text-gray-500">No appointments found.</p>
          )}
        </div>

        {/* Detail / Create panel */}
        {(selected || isCreating) && (
          <div className="w-96 shrink-0 rounded-xl border bg-white p-5">
            {isCreating ? (
              <>
                <h2 className="mb-4 text-lg font-bold">New Appointment</h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Client Name</label>
                    <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
                    <input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
                    <input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="(555) 000-0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Appointment["type"] })} className="w-full rounded-lg border px-3 py-2 text-sm">
                        <option value="consultation">Consultation</option>
                        <option value="site_visit">Site Visit</option>
                        <option value="delivery">Delivery</option>
                        <option value="pickup">Pickup</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Duration</label>
                      <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                        <option value="30 min">30 min</option>
                        <option value="45 min">45 min</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Date</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Time</label>
                      <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm">
                        {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" rows={3} placeholder="Event details, special requests..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create</button>
                    <button onClick={() => { setIsCreating(false); setForm(emptyAppointment); }} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
                  </div>
                </div>
              </>
            ) : selected && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Appointment Detail</h2>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{typeLabels[selected.type]?.icon}</span>
                    <div>
                      <p className="text-lg font-semibold">{selected.clientName}</p>
                      <p className="text-gray-500">{selected.clientEmail}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selected.date}</span></div>
                      <div><span className="text-gray-500">Time:</span> <span className="font-medium">{selected.time}</span></div>
                      <div><span className="text-gray-500">Duration:</span> <span className="font-medium">{selected.duration}</span></div>
                      <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selected.clientPhone}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeLabels[selected.type]?.color}`}>{typeLabels[selected.type]?.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusLabels[selected.status]?.color}`}>{selected.status}</span>
                  </div>

                  {selected.notes && (
                    <div>
                      <p className="text-gray-500">Notes:</p>
                      <p className="mt-1 rounded-lg bg-gray-50 p-2">{selected.notes}</p>
                    </div>
                  )}

                  <hr />
                  <p className="text-xs font-semibold uppercase text-gray-500">Update Status</p>
                  <div className="flex flex-wrap gap-1">
                    {(["scheduled", "confirmed", "completed", "cancelled", "no_show"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selected.id, s)}
                        className={`rounded border px-2 py-1 text-xs transition hover:bg-gray-50 ${
                          selected.status === s ? "border-indigo-500 bg-indigo-50 text-indigo-700" : ""
                        }`}
                      >
                        {s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>

                  <hr />
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50">
                      Send Reminder
                    </button>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
