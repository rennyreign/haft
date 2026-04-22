'use client';

import { useState, useEffect } from "react";
import { isAuthenticated, logout } from "@/lib/auth";
import LoginPage from "./LoginPage";
import OverviewPage from "./OverviewPage";
import Dashboard from "./Dashboard";
import { SignOut } from "@phosphor-icons/react";

type View = "login" | "overview" | "dashboard";

export default function AppShell() {
  const [view, setView] = useState<View>("login");

  useEffect(() => {
    if (isAuthenticated()) {
      setView("overview");
    }
  }, []);

  if (view === "login") {
    return <LoginPage onSuccess={() => setView("overview")} />;
  }

  return (
    <div className="flex flex-col flex-1 bg-navy-950 min-h-[100dvh]">
      {/* Top nav — shared between overview and dashboard */}
      <header className="h-[60px] bg-navy-950/95 border-b border-white/[0.05] backdrop-blur-md flex items-center px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3 flex-1">
          <img
            src="/adx-logo-white.png"
            alt="ADX Engine"
            className="h-[28px] w-auto"
          />
          <div className="w-px h-5 bg-white/[0.08]" />
          <span className="text-slate-100 font-extrabold text-[16px] tracking-tight">
            HAFT
          </span>
          <span className="text-slate-400 text-[14px] font-normal hidden sm:inline">
            Distress Sourcing
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <NavButton
            active={view === "overview"}
            onClick={() => setView("overview")}
          >
            Overview
          </NavButton>
          <NavButton
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          >
            Live Feed
          </NavButton>
          <button
            onClick={() => { logout(); setView("login"); }}
            className="ml-3 flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-[13px] transition-colors px-3 py-2 rounded-[10px] hover:bg-white/[0.03]"
          >
            <SignOut size={16} weight="bold" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </nav>
      </header>

      {/* Views */}
      {view === "overview" && (
        <OverviewPage onViewDashboard={() => setView("dashboard")} />
      )}
      {view === "dashboard" && <Dashboard />}
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] font-medium px-3 py-2 rounded-[10px] transition-colors ${
        active
          ? "bg-teal-500/10 text-teal-400"
          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
      }`}
    >
      {children}
    </button>
  );
}
