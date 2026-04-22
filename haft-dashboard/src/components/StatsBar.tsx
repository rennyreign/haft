'use client';

import { Buildings } from "@phosphor-icons/react";

interface StatsBarProps {
  totalFilings: number;
  thisWeek: number;
  today: number;
  boroughCounts: Record<string, number>;
}

export default function StatsBar({ totalFilings, thisWeek, today, boroughCounts }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Total Filings" value={totalFilings.toLocaleString()} />
      <StatCard label="This Week" value={thisWeek.toLocaleString()} />
      <StatCard label="Today" value={today.toLocaleString()} />

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-[16px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Buildings size={14} weight="bold" className="text-slate-600" />
          <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600">
            Borough Breakdown
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(boroughCounts).map(([borough, count]) => (
            <span
              key={borough}
              className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase"
            >
              {borough}
              <span className="text-teal-400/70">{count}</span>
            </span>
          ))}
          {Object.keys(boroughCounts).length === 0 && (
            <span className="text-[13px] text-slate-600">No data</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[16px] p-5">
      <div className="text-[32px] font-extrabold tracking-tighter text-slate-100 leading-none">
        {value}
      </div>
      <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600 mt-2">
        {label}
      </div>
    </div>
  );
}
