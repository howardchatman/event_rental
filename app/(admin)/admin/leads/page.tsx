"use client";

import { useState } from "react";
import { formatCents } from "@/lib/utils";

type LeadStatus = "new" | "contacted" | "quoted" | "negotiating" | "won" | "lost";
type LeadPriority = "hot" | "warm" | "cold";

interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  estimatedValueCents: number;
  status: LeadStatus;
  priority: LeadPriority;
  source: string;
  lastContactDate: string;
  nextFollowUp: string;
  notes: string;
  activities: Activity[];
}

interface Activity {
  id: string;
  type: "email" | "call" | "note" | "quote" | "meeting";
  description: string;
  date: string;
}

const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah@example.com",
    clientPhone: "(555) 123-4567",
    eventType: "Wedding",
    eventDate: "2026-06-15",
    guestCount: 150,
    estimatedValueCents: 485000,
    status: "quoted",
    priority: "hot",
    source: "Website Inquiry",
    lastContactDate: "2026-01-30",
    nextFollowUp: "2026-02-03",
    notes: "Outdoor ceremony + reception. Needs full package: tent, tables, chairs, lighting, AV.",
    activities: [
      { id: "a1", type: "email", description: "Sent initial quote — $4,850 for full wedding package", date: "2026-01-30" },
      { id: "a2", type: "call", description: "Discussed tent options — prefers 40x60 over two 20x40s", date: "2026-01-28" },
      { id: "a3", type: "meeting", description: "Site visit at Oak Valley Estate", date: "2026-01-25" },
    ],
  },
  {
    id: "lead-2",
    clientName: "Marcus Rivera",
    clientEmail: "marcus@example.com",
    clientPhone: "(555) 234-5678",
    eventType: "Corporate Event",
    eventDate: "2026-07-20",
    guestCount: 80,
    estimatedValueCents: 235000,
    status: "new",
    priority: "warm",
    source: "Referral",
    lastContactDate: "2026-01-28",
    nextFollowUp: "2026-02-03",
    notes: "Annual company summer party. Needs AV setup, tables, some décor.",
    activities: [
      { id: "a4", type: "email", description: "Initial inquiry received — wants quote for summer party", date: "2026-01-28" },
    ],
  },
  {
    id: "lead-3",
    clientName: "Emily Chen",
    clientEmail: "emily@example.com",
    clientPhone: "(555) 345-6789",
    eventType: "Birthday Party",
    eventDate: "2026-03-28",
    guestCount: 40,
    estimatedValueCents: 95000,
    status: "negotiating",
    priority: "hot",
    source: "Instagram",
    lastContactDate: "2026-02-01",
    nextFollowUp: "2026-02-02",
    notes: "30th birthday, outdoor. Accepted quote pending final item selections.",
    activities: [
      { id: "a5", type: "quote", description: "Revised quote sent — $950 with 10% discount", date: "2026-02-01" },
      { id: "a6", type: "call", description: "Discussed adding string lights — she's interested", date: "2026-01-31" },
      { id: "a7", type: "email", description: "Initial quote — $1,050", date: "2026-01-29" },
    ],
  },
  {
    id: "lead-4",
    clientName: "Tom Anderson",
    clientEmail: "tom@example.com",
    clientPhone: "(555) 456-7890",
    eventType: "Graduation Party",
    eventDate: "2026-05-30",
    guestCount: 60,
    estimatedValueCents: 125000,
    status: "contacted",
    priority: "warm",
    source: "Google Search",
    lastContactDate: "2026-01-27",
    nextFollowUp: "2026-02-04",
    notes: "Backyard graduation party. Needs tent and tables.",
    activities: [
      { id: "a8", type: "email", description: "Sent product catalog and pricing sheet", date: "2026-01-27" },
    ],
  },
  {
    id: "lead-5",
    clientName: "Diana Foster",
    clientEmail: "diana@example.com",
    clientPhone: "(555) 567-8901",
    eventType: "Charity Gala",
    eventDate: "2026-09-15",
    guestCount: 200,
    estimatedValueCents: 620000,
    status: "new",
    priority: "cold",
    source: "Trade Show",
    lastContactDate: "2026-01-20",
    nextFollowUp: "2026-02-10",
    notes: "Met at the Event Expo booth. Large gala — high potential. Event is far out.",
    activities: [
      { id: "a9", type: "note", description: "Collected business card at trade show", date: "2026-01-20" },
    ],
  },
  {
    id: "lead-6",
    clientName: "Kevin Brooks",
    clientEmail: "kevin@example.com",
    clientPhone: "(555) 678-9012",
    eventType: "Wedding",
    eventDate: "2026-04-20",
    guestCount: 100,
    estimatedValueCents: 320000,
    status: "won",
    priority: "hot",
    source: "Website Inquiry",
    lastContactDate: "2026-02-01",
    nextFollowUp: "",
    notes: "Converted! Order #ord-k7b8 created. Full wedding package.",
    activities: [
      { id: "a10", type: "quote", description: "Final invoice sent and paid — Order created", date: "2026-02-01" },
      { id: "a11", type: "call", description: "Final negotiation — agreed on $3,200 package", date: "2026-01-31" },
    ],
  },
];

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-100" },
  contacted: { label: "Contacted", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  quoted: { label: "Quoted", color: "text-purple-700", bgColor: "bg-purple-100" },
  negotiating: { label: "Negotiating", color: "text-orange-700", bgColor: "bg-orange-100" },
  won: { label: "Won", color: "text-green-700", bgColor: "bg-green-100" },
  lost: { label: "Lost", color: "text-red-700", bgColor: "bg-red-100" },
};

const priorityConfig: Record<LeadPriority, { label: string; color: string; icon: string }> = {
  hot: { label: "Hot", color: "text-red-600", icon: "🔥" },
  warm: { label: "Warm", color: "text-orange-500", icon: "🟡" },
  cold: { label: "Cold", color: "text-blue-500", icon: "🔵" },
};

const activityIcons: Record<string, string> = {
  email: "📧",
  call: "📞",
  note: "📝",
  quote: "💰",
  meeting: "🤝",
};

const PIPELINE_STAGES: LeadStatus[] = ["new", "contacted", "quoted", "negotiating", "won"];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
  const [isCreating, setIsCreating] = useState(false);
  const [newActivity, setNewActivity] = useState("");
  const [newActivityType, setNewActivityType] = useState<Activity["type"]>("note");

  const pipelineValue = (status: LeadStatus) =>
    leads.filter((l) => l.status === status).reduce((s, l) => s + l.estimatedValueCents, 0);

  const totalPipeline = leads
    .filter((l) => l.status !== "won" && l.status !== "lost")
    .reduce((s, l) => s + l.estimatedValueCents, 0);

  const wonValue = leads.filter((l) => l.status === "won").reduce((s, l) => s + l.estimatedValueCents, 0);

  const handleStatusChange = (id: string, status: LeadStatus) => {
    setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const handleAddActivity = () => {
    if (!selected || !newActivity.trim()) return;
    const activity: Activity = {
      id: `act-${Date.now()}`,
      type: newActivityType,
      description: newActivity.trim(),
      date: "2026-02-02",
    };
    const updated = {
      ...selected,
      activities: [activity, ...selected.activities],
      lastContactDate: "2026-02-02",
    };
    setLeads(leads.map((l) => (l.id === selected.id ? updated : l)));
    setSelected(updated);
    setNewActivity("");
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Leads</h1>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border">
            <button
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 text-sm font-medium ${viewMode === "pipeline" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-medium ${viewMode === "list" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + New Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Pipeline Value</p>
          <p className="mt-1 text-2xl font-bold">{formatCents(totalPipeline)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Won This Month</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{formatCents(wonValue)}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Active Leads</p>
          <p className="mt-1 text-2xl font-bold">{leads.filter((l) => l.status !== "won" && l.status !== "lost").length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Follow-Ups Today</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{leads.filter((l) => l.nextFollowUp === "2026-02-03" || l.nextFollowUp === "2026-02-02").length}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Pipeline view */}
          {viewMode === "pipeline" && (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = leads.filter((l) => l.status === stage);
                return (
                  <div key={stage} className="w-64 shrink-0">
                    <div className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
                      <span className={`text-sm font-semibold ${statusConfig[stage].color}`}>
                        {statusConfig[stage].label} ({stageLeads.length})
                      </span>
                      <span className="text-xs text-gray-500">{formatCents(pipelineValue(stage))}</span>
                    </div>
                    <div className="space-y-2">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => { setSelected(lead); setIsCreating(false); }}
                          className={`cursor-pointer rounded-lg border bg-white p-3 transition hover:shadow-md ${
                            selected?.id === lead.id ? "border-indigo-500 ring-1 ring-indigo-500" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{lead.clientName}</span>
                            <span>{priorityConfig[lead.priority].icon}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{lead.eventType} &middot; {lead.guestCount} guests</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{formatCents(lead.estimatedValueCents)}</p>
                          <p className="text-xs text-gray-400 mt-1">📅 {lead.eventDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List view */}
          {viewMode === "list" && (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Client</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Event</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Value</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Priority</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-600">Follow-Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => { setSelected(lead); setIsCreating(false); }}
                      className={`cursor-pointer hover:bg-gray-50 ${selected?.id === lead.id ? "bg-indigo-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{lead.clientName}</p>
                        <p className="text-xs text-gray-500">{lead.clientEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{lead.eventType}<br /><span className="text-xs text-gray-500">{lead.guestCount} guests</span></td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCents(lead.estimatedValueCents)}</td>
                      <td className="px-4 py-3">{priorityConfig[lead.priority].icon} <span className="text-xs">{priorityConfig[lead.priority].label}</span></td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[lead.status].bgColor} ${statusConfig[lead.status].color}`}>
                          {statusConfig[lead.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{lead.nextFollowUp || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && !isCreating && (
          <div className="w-96 shrink-0 space-y-4 rounded-xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Lead Detail</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Client info */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                {selected.clientName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold">{selected.clientName}</p>
                <p className="text-sm text-gray-500">{selected.clientEmail}</p>
                <p className="text-sm text-gray-500">{selected.clientPhone}</p>
              </div>
            </div>

            {/* Event info */}
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">Event:</span> <span className="font-medium">{selected.eventType}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selected.eventDate}</span></div>
                <div><span className="text-gray-500">Guests:</span> <span className="font-medium">{selected.guestCount}</span></div>
                <div><span className="text-gray-500">Value:</span> <span className="font-bold">{formatCents(selected.estimatedValueCents)}</span></div>
                <div><span className="text-gray-500">Source:</span> <span className="font-medium">{selected.source}</span></div>
                <div><span className="text-gray-500">Priority:</span> {priorityConfig[selected.priority].icon} {priorityConfig[selected.priority].label}</div>
              </div>
            </div>

            {selected.notes && (
              <div className="text-sm">
                <p className="font-medium text-gray-700">Notes</p>
                <p className="mt-1 text-gray-600">{selected.notes}</p>
              </div>
            )}

            {/* Status pipeline */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Move to Stage</p>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(statusConfig) as LeadStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selected.id, s)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      selected.status === s
                        ? `${statusConfig[s].bgColor} ${statusConfig[s].color} border-current`
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add activity */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Log Activity</p>
              <div className="flex gap-2">
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value as Activity["type"])}
                  className="rounded-lg border px-2 py-1.5 text-xs"
                >
                  <option value="note">📝 Note</option>
                  <option value="email">📧 Email</option>
                  <option value="call">📞 Call</option>
                  <option value="quote">💰 Quote</option>
                  <option value="meeting">🤝 Meeting</option>
                </select>
                <input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddActivity()}
                  placeholder="What happened?"
                  className="flex-1 rounded-lg border px-3 py-1.5 text-xs"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!newActivity.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Activity timeline */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Activity History</p>
              <div className="space-y-2">
                {selected.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5">{activityIcons[act.type]}</span>
                    <div className="flex-1">
                      <p className="text-gray-800">{act.description}</p>
                      <p className="text-xs text-gray-400">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create lead panel */}
        {isCreating && (
          <div className="w-96 shrink-0 rounded-xl border bg-white p-5">
            <h2 className="mb-4 text-lg font-bold">New Lead</h2>
            <div className="space-y-3">
              <input placeholder="Client name" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input placeholder="Email" type="email" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input placeholder="Phone" className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full rounded-lg border px-3 py-2 text-sm">
                  <option>Wedding</option>
                  <option>Corporate Event</option>
                  <option>Birthday Party</option>
                  <option>Graduation</option>
                  <option>Charity Gala</option>
                  <option>Other</option>
                </select>
                <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Guest count" className="w-full rounded-lg border px-3 py-2 text-sm" />
                <input type="number" placeholder="Est. value ($)" className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <select className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Source...</option>
                <option>Website Inquiry</option>
                <option>Referral</option>
                <option>Google Search</option>
                <option>Instagram</option>
                <option>Trade Show</option>
                <option>Phone Call</option>
              </select>
              <textarea placeholder="Notes..." rows={3} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <div className="flex gap-3">
                <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create Lead</button>
                <button onClick={() => setIsCreating(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
