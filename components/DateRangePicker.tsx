"use client";

import { useState, useEffect } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  // Min date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    setStart(startDate);
    setEnd(endDate);
  }, [startDate, endDate]);

  const handleStartChange = (val: string) => {
    setStart(val);
    if (end && val > end) {
      setEnd(val);
      onChange(val, val);
    } else {
      onChange(val, end);
    }
  };

  const handleEndChange = (val: string) => {
    setEnd(val);
    onChange(start, val);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <label className="mb-1 block font-body text-xs font-medium text-warm-gray">
          Start Date
        </label>
        <input
          type="date"
          value={start}
          min={minDate}
          onChange={(e) => handleStartChange(e.target.value)}
          className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block font-body text-xs font-medium text-warm-gray">
          End Date
        </label>
        <input
          type="date"
          value={end}
          min={start || minDate}
          onChange={(e) => handleEndChange(e.target.value)}
          className="w-full border border-ivory-dark bg-white px-4 py-2.5 font-body text-sm text-charcoal focus:border-champagne focus:outline-none focus:ring-1 focus:ring-champagne"
        />
      </div>
    </div>
  );
}
