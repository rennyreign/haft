'use client';

import { useState } from "react";
import { Lock, ArrowRight, Warning } from "@phosphor-icons/react";
import { login } from "@/lib/auth";

interface LoginPageProps {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);

    setTimeout(() => {
      if (login(username, password)) {
        onSuccess();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-[100dvh] bg-navy-950 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal-500/[0.04] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <img
            src="/adx-logo-white.png"
            alt="ADX Engine"
            className="h-[36px] w-auto mx-auto mb-6"
          />
          <h1 className="text-slate-100 text-[28px] font-extrabold tracking-tighter leading-none mb-2">
            HAFT Operator
          </h1>
          <p className="text-slate-500 text-[14px]">
            Distress Sourcing Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} weight="bold" className="text-teal-400" />
            <span className="text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600">
              Secure Access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-slate-600 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-navy-900 border border-white/[0.06] rounded-[10px] text-slate-300 text-[14px] px-4 py-3 outline-none focus:border-teal-500/40 transition-colors placeholder:text-slate-600"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium tracking-[0.1em] uppercase text-slate-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-navy-900 border border-white/[0.06] rounded-[10px] text-slate-300 text-[14px] px-4 py-3 outline-none focus:border-teal-500/40 transition-colors placeholder:text-slate-600"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-[10px] px-4 py-3">
                <Warning size={16} weight="bold" className="text-red-400 shrink-0" />
                <span className="text-red-400 text-[13px]">Invalid credentials</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-navy-950 font-semibold text-[15px] rounded-full py-3 px-6 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="text-[14px]">Authenticating...</span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} weight="bold" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-[11px] mt-6">
          ADX Engine — Internal operator dashboard
        </p>
      </div>
    </div>
  );
}
