"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format,
  addMonths, subMonths, isSameMonth, isToday, isSameDay,
  parseISO,
} from "date-fns";
import { createClient } from "@/lib/supabase/client";

interface CalendarOrder {
  id: string;
  status: string;
  event_date_start: string;
  event_date_end: string;
  total_cents: number;
}

export default function AdminCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [orders, setOrders] = useState<CalendarOrder[]>([]);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data } = await supabase
      .from("orders")
      .select("id, status, event_date_start, event_date_end, total_cents")
      .not("status", "eq", "cancelled")
      .or(`event_date_start.lte.${end},event_date_end.gte.${start}`)
      .order("event_date_start");

    setOrders(data || []);
  }, [currentMonth]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start to Monday
  const startDay = monthStart.getDay();
  const paddingDays = startDay === 0 ? 6 : startDay - 1;

  const getOrdersForDay = (day: Date) => {
    return orders.filter((o) => {
      const start = parseISO(o.event_date_start);
      const end = parseISO(o.event_date_end);
      return day >= start && day <= end;
    });
  };

  const statusColors: Record<string, string> = {
    pending_payment: "bg-yellow-400",
    paid: "bg-green-400",
    scheduled: "bg-blue-400",
    out_for_delivery: "bg-purple-400",
    completed: "bg-gray-400",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            &larr; Prev
          </button>
          <span className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Next &rarr;
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px rounded-t-lg bg-gray-200">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-semibold uppercase text-gray-600">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Padding cells */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[100px] bg-gray-50" />
        ))}

        {days.map((day) => {
          const dayOrders = getOrdersForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] bg-white p-2 ${
                isToday(day) ? "ring-2 ring-inset ring-indigo-500" : ""
              }`}
            >
              <span className={`text-sm font-medium ${
                isToday(day) ? "text-indigo-600" : "text-gray-700"
              }`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayOrders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className={`rounded px-1 py-0.5 text-xs text-white ${statusColors[o.status] || "bg-gray-400"}`}
                    title={`Order ${o.id.slice(0, 8)} – ${o.status}`}
                  >
                    {o.id.slice(0, 6)}
                  </div>
                ))}
                {dayOrders.length > 3 && (
                  <span className="text-xs text-gray-500">+{dayOrders.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded ${color}`} />
            <span className="text-gray-600">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
