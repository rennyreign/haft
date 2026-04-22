'use client';

import {
  MagnifyingGlass,
  Buildings,
  ArrowSquareOut,
  Funnel,
  CalendarBlank,
} from "@phosphor-icons/react";
import type { Filing } from "@/types/database";

export interface FilterState {
  borough: string;
  dateFrom: string;
  dateTo: string;
  balanceFilter: string;
}

interface FilingsTableProps {
  filings: Filing[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const BOROUGHS = ["All", "Manhattan", "Bronx", "Brooklyn", "Queens"];
const BALANCE_OPTIONS = ["All", "Confirmed", "Unconfirmed"];

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FilingsTable({ filings, filters, onFilterChange }: FilingsTableProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const inputClasses =
    "bg-navy-900 border border-white/[0.06] rounded-[10px] text-slate-300 text-[13px] px-3 py-2 outline-none focus:border-teal-500/40 transition-colors";

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600">
          <Funnel size={14} weight="bold" />
          Filters
        </div>

        <select
          value={filters.borough}
          onChange={(e) => updateFilter("borough", e.target.value)}
          className={inputClasses}
        >
          {BOROUGHS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <CalendarBlank size={14} className="text-slate-600" />
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className={`${inputClasses} w-[140px]`}
            placeholder="From"
          />
          <span className="text-slate-600 text-[13px]">to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className={`${inputClasses} w-[140px]`}
            placeholder="To"
          />
        </div>

        <select
          value={filters.balanceFilter}
          onChange={(e) => updateFilter("balanceFilter", e.target.value)}
          className={inputClasses}
        >
          {BALANCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt === "All" ? "Balance: All" : opt}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filings.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Property Address
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Borough
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Filing Date
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Doc Type
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Party 1
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Party 2
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Est. Balance
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Confirmed
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  ACRIS
                </th>
              </tr>
            </thead>
            <tbody>
              {filings.map((filing) => (
                <tr
                  key={filing.document_id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="text-[13px] text-slate-300 font-medium px-4 py-3 border-b border-white/[0.04] max-w-[220px] truncate">
                    {filing.property_address ?? "--"}
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04]">
                    {filing.borough ?? "--"}
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04] whitespace-nowrap">
                    {formatDate(filing.filing_date)}
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04] max-w-[150px] truncate">
                    {filing.document_type ?? "--"}
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04] max-w-[160px] truncate">
                    {filing.party_1_name ?? "--"}
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04] max-w-[160px] truncate">
                    {filing.party_2_name ?? "--"}
                  </td>
                  <td className="text-[12px] text-teal-400 font-mono px-4 py-3 border-b border-white/[0.04] whitespace-nowrap">
                    {filing.balance_confirmed
                      ? formatCurrency(filing.estimated_loan_balance)
                      : "--"}
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.04]">
                    <ConfirmedBadge confirmed={filing.balance_confirmed} />
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.04]">
                    {filing.acris_url ? (
                      <a
                        href={filing.acris_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-teal-400 text-[12px] font-medium hover:text-teal-500 transition-colors"
                      >
                        View
                        <ArrowSquareOut size={12} weight="bold" />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-[12px]">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ConfirmedBadge({ confirmed }: { confirmed: boolean | null }) {
  if (confirmed) {
    return (
      <span className="inline-flex items-center rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.2em] uppercase">
        Yes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-500 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.2em] uppercase">
      No
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-6 mb-5">
        <Buildings size={40} weight="thin" className="text-slate-600" />
      </div>
      <h3 className="text-[16px] font-semibold text-slate-400 mb-1">No filings found</h3>
      <p className="text-[13px] text-slate-600 max-w-[300px]">
        No filings match your current filters. Try adjusting the borough, date range, or balance filter.
      </p>
    </div>
  );
}
