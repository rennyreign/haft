'use client';

import { useState, useRef } from "react";
import React from "react";
import {
  MagnifyingGlass,
  Buildings,
  ArrowSquareOut,
  Funnel,
  CalendarBlank,
  Copy,
  Check,
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
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onFilterChangeMultiple?: (updates: Partial<FilterState>) => void;
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

export default function FilingsTable({ filings, filters, onFilterChange, onFilterChangeMultiple }: FilingsTableProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange(key, value);
  };

  const updateMultipleFilters = (updates: Partial<FilterState>) => {
    if (onFilterChangeMultiple) {
      onFilterChangeMultiple(updates);
    } else {
      // Fallback for single-update onFilterChange
      Object.entries(updates).forEach(([key, value]) => {
        onFilterChange(key as keyof FilterState, value as string);
      });
    }
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
           <DatePickerDropdown 
             filters={filters} 
             onFilterChange={(key: keyof FilterState, value: string) => updateFilter(key, value)}
             onFilterChangeMultiple={updateMultipleFilters}
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
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full border-collapse" style={{ pointerEvents: 'auto' }}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Property Address
                </th>
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  Status
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
                <th className="text-left text-[10px] font-medium tracking-[0.15em] uppercase text-slate-600 px-4 py-3">
                  NYSCEF
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
                    <CopyableCell text={filing.property_address ?? "--"} />
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.04]">
                    <DemoBadge filing={filing} />
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
                    <CopyableCell text={filing.party_1_name ?? "--"} />
                  </td>
                  <td className="text-[13px] text-slate-400 px-4 py-3 border-b border-white/[0.04] max-w-[160px] truncate">
                    <CopyableCell text={filing.party_2_name ?? "--"} />
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
                        className="inline-flex items-center gap-1 text-teal-400 text-[12px] font-medium hover:text-teal-500 transition-colors cursor-pointer"
                      >
                        View
                        <ArrowSquareOut size={12} weight="bold" />
                      </a>
                    ) : (
                      <span className="text-slate-600 text-[12px]">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-white/[0.04]">
                    <NYSCEFSearchCell filing={filing} />
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

function DatePickerDropdown({
  filters,
  onFilterChange,
  onFilterChangeMultiple,
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onFilterChangeMultiple?: (updates: Partial<FilterState>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const inputClasses =
    "bg-navy-900 border border-white/[0.06] rounded-[8px] text-slate-300 text-[12px] px-2 py-1.5 outline-none focus:border-teal-500/40 transition-colors";

  const getDateRange = (days: number | null) => {
    const now = new Date();
    // Create today's date in YYYY-MM-DD format without timezone issues
    const todayStr = now.toISOString().split("T")[0];
    
    if (days === null) {
      return {
        from: todayStr,
        to: todayStr,
      };
    }

    // Calculate the date N days ago
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - days);
    const fromStr = from.toISOString().split("T")[0];
    
    return {
      from: fromStr,
      to: todayStr,
    };
  };

  const handleQuickFilter = (days: number | null) => {
    const range = getDateRange(days);
    if (onFilterChangeMultiple) {
      onFilterChangeMultiple({ dateFrom: range.from, dateTo: range.to });
    } else {
      onFilterChange("dateFrom", range.from);
      onFilterChange("dateTo", range.to);
    }
  };

  const buttonClass = (isActive: boolean) =>
    `w-full px-2 py-1.5 rounded-[6px] text-[11px] font-medium transition-colors text-left ${
      isActive
        ? "bg-teal-500/20 border border-teal-500/40 text-teal-400"
        : "bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/[0.1]"
    }`;

  const isToday =
    filters.dateFrom === filters.dateTo &&
    filters.dateFrom === new Date().toISOString().split("T")[0];

  const isLast3 = (() => {
    const range = getDateRange(3);
    return filters.dateFrom === range.from && filters.dateTo === range.to;
  })();

  const isLast7 = (() => {
    const range = getDateRange(7);
    return filters.dateFrom === range.from && filters.dateTo === range.to;
  })();

  const isLast30 = (() => {
    const range = getDateRange(30);
    return filters.dateFrom === range.from && filters.dateTo === range.to;
  })();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-navy-900 border border-white/[0.06] rounded-[8px] text-slate-300 text-[13px] hover:border-white/[0.1] transition-colors"
      >
        <CalendarBlank size={14} weight="bold" />
        <span className="hidden sm:inline">Dates</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-navy-800 border border-white/[0.1] rounded-[8px] p-3 w-[240px] z-50 shadow-lg">
          {/* Quick filters */}
          <div className="space-y-1.5 mb-3 pb-3 border-b border-white/[0.06]">
            <button
              onClick={() => {
                handleQuickFilter(null);
                setIsOpen(false);
              }}
              className={buttonClass(isToday)}
            >
              Today
            </button>
            <button
              onClick={() => {
                handleQuickFilter(3);
                setIsOpen(false);
              }}
              className={buttonClass(isLast3)}
            >
              Last 3 days
            </button>
            <button
              onClick={() => {
                handleQuickFilter(7);
                setIsOpen(false);
              }}
              className={buttonClass(isLast7)}
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                handleQuickFilter(30);
                setIsOpen(false);
              }}
              className={buttonClass(isLast30)}
            >
              Last 30 days
            </button>
          </div>

          {/* Precision date pickers */}
          <div className="space-y-2">
            <label className="block text-[10px] font-medium uppercase tracking-[0.1em] text-slate-500">
              Custom range
            </label>
            <div className="space-y-1">
              <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange("dateFrom", e.target.value)}
                  className={inputClasses}
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange("dateTo", e.target.value)}
                  className={inputClasses}
                />
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function CopyableCell({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (text === "--") {
    return <span>{text}</span>;
  }

  return (
    <div 
      ref={cellRef}
      className="relative inline-block w-full"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="truncate block cursor-pointer hover:text-teal-400 transition-colors">{text}</span>

      {showTooltip && cellRef.current && (
        <div 
          className="fixed bg-navy-800 border border-white/[0.1] rounded-[6px] px-3 py-2 text-[11px] text-slate-200 whitespace-normal break-words max-w-[320px] z-[9999] shadow-lg pointer-events-none"
          style={{
            top: `${cellRef.current.getBoundingClientRect().top - 8}px`,
            left: `${Math.min(cellRef.current.getBoundingClientRect().left, window.innerWidth - 340)}px`,
          }}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1 leading-relaxed">{text}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-1 text-slate-500 hover:text-teal-400 transition-colors rounded hover:bg-white/[0.05] pointer-events-auto cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check size={12} weight="bold" className="text-teal-400" />
              ) : (
                <Copy size={12} weight="bold" />
              )}
            </button>
          </div>
          <div className="absolute top-full left-4 w-2 h-2 bg-navy-800 border-r border-b border-white/[0.1] transform rotate-45 -translate-y-1/2"></div>
        </div>
      )}
    </div>
  );
}

function NYSCEFSearchCell({ filing }: { filing: Filing }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const partyName = filing.party_1_name || "Party Name";

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(partyName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1.5">
      <a
        href="https://iapps.courts.state.ny.us/nyscef/CaseSearch?TAB=name"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-teal-400 text-[12px] font-medium hover:text-teal-500 transition-colors cursor-pointer"
      >
        Search
        <ArrowSquareOut size={12} weight="bold" />
      </a>

      <div className="relative">
        <button
          onClick={handleCopy}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="p-1 text-slate-500 hover:text-teal-400 transition-colors rounded hover:bg-white/[0.05] cursor-pointer"
          title={`Copy: ${partyName}`}
        >
          {copied ? (
            <Check size={12} weight="bold" className="text-teal-400" />
          ) : (
            <Copy size={12} weight="bold" />
          )}
        </button>

        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-navy-800 border border-white/[0.1] rounded-[6px] px-2.5 py-1.5 text-[10px] text-slate-200 whitespace-nowrap z-50 pointer-events-none">
            {partyName}
            <div className="absolute top-full right-2 w-1 h-1 bg-navy-800 border-b border-r border-white/[0.1]" />
          </div>
        )}
      </div>
    </div>
  );
}

function DemoBadge({ filing }: { filing: Filing }) {
  // Check if this is demo data - you can adjust this logic based on your demo data criteria
  const isDemo = filing.document_id?.startsWith('DEMO') || 
                 filing.property_address?.includes('DEMO') ||
                 filing.party_1_name?.includes('DEMO');
  
  if (!isDemo) {
    return null;
  }
  
  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 text-[9px] font-medium tracking-[0.15em] uppercase">
      Demo
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
