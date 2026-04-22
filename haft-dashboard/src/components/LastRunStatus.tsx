'use client';

import { ClockCounterClockwise } from "@phosphor-icons/react";

interface LastRunStatusProps {
  lastRun: {
    ran_at: string | null;
    status: string | null;
    records_found: number | null;
  } | null;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function LastRunStatus({ lastRun }: LastRunStatusProps) {
  if (!lastRun) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-slate-600">
        <div className="w-2 h-2 rounded-full bg-slate-700" />
        <span>No run data available</span>
      </div>
    );
  }

  const isSuccess = lastRun.status === "success";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          isSuccess
            ? "bg-teal-400 shadow-[0_0_8px_rgba(0,180,180,0.5)] animate-pulse-dot"
            : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        }`}
      />
      <div className="flex items-center gap-2 text-[13px]">
        <ClockCounterClockwise size={14} weight="bold" className="text-slate-500" />
        <span className="text-slate-400">
          {lastRun.ran_at ? `Ran ${getRelativeTime(lastRun.ran_at)}` : "Unknown"}
        </span>
        {lastRun.records_found !== null && (
          <span className="text-slate-600">
            / {lastRun.records_found} records
          </span>
        )}
      </div>
    </div>
  );
}
