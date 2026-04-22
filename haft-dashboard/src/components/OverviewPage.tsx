'use client';

import {
  Lightning,
  MagnifyingGlass,
  Funnel,
  EnvelopeSimple,
  ArrowRight,
  Buildings,
  ClockCountdown,
  ShieldCheck,
  ChartLineUp,
} from "@phosphor-icons/react";

interface OverviewPageProps {
  onViewDashboard: () => void;
}

export default function OverviewPage({ onViewDashboard }: OverviewPageProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-12">
      {/* Hero */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(0,180,180,0.5)] animate-pulse-dot" />
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-teal-400">
            Operator Active
          </span>
        </div>

        <h1 className="text-slate-100 text-[40px] md:text-[56px] font-extrabold tracking-tighter leading-[0.92] mb-4 max-w-[700px]">
          Distress signals,{" "}
          <span className="text-teal-400">delivered daily.</span>
        </h1>

        <p className="text-slate-400 text-[16px] leading-[1.7] max-w-[560px] mb-8">
          The HAFT Operator monitors NYC ACRIS public records for commercial
          pre-foreclosure filings. It runs every morning, filters against your
          criteria, and delivers qualifying opportunities to your inbox.
          No searching. No logging in. No manual work.
        </p>

        <button
          onClick={onViewDashboard}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-navy-950 font-semibold text-[15px] rounded-full py-3 pl-7 pr-3 transition-colors"
        >
          View Live Feed
          <span className="w-9 h-9 bg-navy-950/12 rounded-full flex items-center justify-center">
            <ArrowRight size={18} weight="bold" />
          </span>
        </button>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600 block mb-6">
          How The Operator Works
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PipelineStep
            number="01"
            icon={<MagnifyingGlass size={20} weight="bold" />}
            title="Fetch"
            description="Queries NYC ACRIS every morning for new lis pendens filings across Manhattan, Bronx, Brooklyn, and Queens."
          />
          <PipelineStep
            number="02"
            icon={<Funnel size={20} weight="bold" />}
            title="Filter"
            description="Applies qualifying criteria — borough, document type, and loan balance range ($3M–$75M) — to isolate real opportunities."
          />
          <PipelineStep
            number="03"
            icon={<Buildings size={20} weight="bold" />}
            title="Enrich"
            description="Cross-references each filing with party records and property details to build a complete picture of every opportunity."
          />
          <PipelineStep
            number="04"
            icon={<EnvelopeSimple size={20} weight="bold" />}
            title="Deliver"
            description="Sends a formatted email digest with all qualifying filings. Weekly summary every Monday with borough breakdown."
          />
        </div>
      </div>

      {/* Key Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-navy-950 border border-teal-500/30 flex items-center justify-center">
              <ClockCountdown size={18} weight="bold" className="text-teal-400" />
            </div>
            <h3 className="text-slate-200 text-[18px] font-bold tracking-tight">Schedule</h3>
          </div>
          <div className="space-y-3">
            <DetailRow label="Daily Digest" value="7:00 AM ET — every day" />
            <DetailRow label="Weekly Summary" value="Mondays — prior 7 days" />
            <DetailRow label="Zero-result days" value="Confirmation email still sent" />
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-navy-950 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck size={18} weight="bold" className="text-teal-400" />
            </div>
            <h3 className="text-slate-200 text-[18px] font-bold tracking-tight">Qualifying Criteria</h3>
          </div>
          <div className="space-y-3">
            <DetailRow label="Signal" value="Pre-foreclosure — lis pendens" />
            <DetailRow label="Geography" value="Manhattan, Bronx, Brooklyn, Queens" />
            <DetailRow label="Loan Balance" value="$3,000,000 – $75,000,000" />
            <DetailRow label="Asset Class" value="All — flagged for manual review" />
          </div>
        </div>
      </div>

      {/* What is an ADX Operator */}
      <div className="border-l-2 border-teal-500/30 pl-5 mb-16 max-w-[640px]">
        <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-slate-600 block mb-2">
          What is an ADX Operator
        </span>
        <p className="text-slate-400 text-[14px] leading-[1.7]">
          A tool requires you to log in, search, and interpret results.
          An ADX Operator runs on a schedule, filters against defined criteria,
          and delivers structured intelligence to your inbox. Your only action
          is reading the output.
        </p>
      </div>

      {/* Phase Roadmap */}
      <div className="mb-16">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600 block mb-6">
          Phase Roadmap
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PhaseCard
            phase="Phase 1"
            status="live"
            title="ACRIS Sourcing"
            items={["Lis pendens monitoring", "Balance filtering", "Daily + weekly email delivery", "Live dashboard"]}
          />
          <PhaseCard
            phase="Phase 2"
            status="build"
            title="Deep Enrichment"
            items={["NYS eCourt integration", "Equity routing logic", "Fit scoring model", "Historical storage"]}
          />
          <PhaseCard
            phase="Phase 3"
            status="concept"
            title="Outreach Automation"
            items={["Lender-side email sequences", "Borrower-side outreach", "LinkedIn automation", "Calendar booking"]}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.05] pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/adx-logo-white.png" alt="ADX Engine" className="h-[20px] w-auto opacity-40" />
          <span className="text-slate-600 text-[12px]">adxengine.net</span>
        </div>
        <div className="flex items-center gap-2">
          <Lightning size={12} weight="fill" className="text-teal-400/40" />
          <span className="text-slate-600 text-[11px]">Built by ADX Engine</span>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-navy-950 border border-teal-500/30 flex items-center justify-center text-teal-400 text-[11px] font-bold tracking-[0.05em] shrink-0">
          {number}
        </div>
        <span className="text-teal-400">{icon}</span>
      </div>
      <h3 className="text-slate-200 text-[16px] font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-slate-500 text-[13px] leading-[1.6]">{description}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-600 text-[13px] shrink-0">{label}</span>
      <span className="text-slate-300 text-[13px] text-right">{value}</span>
    </div>
  );
}

function PhaseCard({
  phase,
  status,
  title,
  items,
}: {
  phase: string;
  status: "live" | "build" | "concept";
  title: string;
  items: string[];
}) {
  const badgeStyles = {
    live: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    build: "bg-amber-500/10 border-amber-500/20 text-amber-300",
    concept: "bg-white/[0.04] border-white/[0.08] text-slate-500",
  };

  const statusLabels = {
    live: "Live",
    build: "In Progress",
    concept: "Planned",
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
          {phase}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-[0.2em] uppercase ${badgeStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <h3 className="text-slate-200 text-[18px] font-bold tracking-tight mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-slate-500">
            <ChartLineUp size={14} weight="bold" className="text-teal-400/40 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
