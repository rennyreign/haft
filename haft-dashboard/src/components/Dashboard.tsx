'use client';

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Filing, Run } from "@/types/database";
import StatsBar from "./StatsBar";
import LastRunStatus from "./LastRunStatus";
import FilingsTable, { type FilterState } from "./FilingsTable";

export default function Dashboard() {
  const [filings, setFilings] = useState<Filing[]>([]);
  const [lastRun, setLastRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    borough: "All",
    dateFrom: "",
    dateTo: "",
    balanceFilter: "All",
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [filingsRes, runsRes] = await Promise.all([
        supabase
          .from("filings")
          .select("*")
          .order("filing_date", { ascending: false })
          .limit(2000),
        supabase
          .from("runs")
          .select("*")
          .order("ran_at", { ascending: false })
          .limit(1),
      ]);

      if (filingsRes.data) setFilings(filingsRes.data as Filing[]);
      if (runsRes.data && runsRes.data.length > 0) setLastRun(runsRes.data[0] as Run);

      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredFilings = useMemo(() => {
    return filings.filter((f) => {
      if (filters.borough !== "All" && f.borough !== filters.borough) return false;

      if (filters.dateFrom && f.filing_date) {
        if (new Date(f.filing_date) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo && f.filing_date) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (new Date(f.filing_date) > toDate) return false;
      }

      if (filters.balanceFilter === "Confirmed" && !f.balance_confirmed) return false;
      if (filters.balanceFilter === "Unconfirmed" && f.balance_confirmed) return false;

      return true;
    });
  }, [filings, filters]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    let thisWeek = 0;
    let today = 0;
    const boroughCounts: Record<string, number> = {};

    for (const f of filteredFilings) {
      if (f.filing_date) {
        const fd = new Date(f.filing_date);
        if (fd >= todayStart) today++;
        if (fd >= weekStart) thisWeek++;
      }
      if (f.borough) {
        boroughCounts[f.borough] = (boroughCounts[f.borough] || 0) + 1;
      }
    }

    return {
      totalFilings: filteredFilings.length,
      thisWeek,
      today,
      boroughCounts,
    };
  }, [filteredFilings]);

  return (
    <main className="max-w-[1200px] lg:max-w-[1440px] w-full mx-auto px-6 md:px-8 py-8 flex-1">
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="mb-5">
            <LastRunStatus
              lastRun={
                lastRun
                  ? {
                      ran_at: lastRun.ran_at,
                      status: lastRun.status,
                      records_found: lastRun.records_found,
                    }
                  : null
              }
            />
          </div>

          <StatsBar
            totalFilings={stats.totalFilings}
            thisWeek={stats.thisWeek}
            today={stats.today}
            boroughCounts={stats.boroughCounts}
          />

          <div className="mt-6">
            <FilingsTable
              filings={filteredFilings}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        </>
      )}
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] rounded-[16px] animate-pulse h-[100px]"
          />
        ))}
      </div>
      <div className="bg-white/[0.03] rounded-[16px] animate-pulse h-[48px]" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white/[0.03] rounded-[10px] animate-pulse h-[44px]"
          />
        ))}
      </div>
    </div>
  );
}
