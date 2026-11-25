import React from 'react';
import { ShieldCheck, CreditCard, Tag, Gift, DollarSign } from 'lucide-react';

export default function Header({ onOpenSecurity, totalCards, totalOffers, totalValue }) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f1117]/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                Card<span className="text-indigo-400">Vault</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Personal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Credit & Debit Card Perks, Categorized Offers & Rewards Manager
            </p>
          </div>
        </div>

        {/* Security Badge & Quick Summary */}
        <div className="flex items-center gap-2.5">
          {/* Portfolio Snapshot Pills (desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Portfolio:</span>
            <span className="text-white font-semibold">{totalCards} Cards</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-semibold">{totalOffers} Offers</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-mono font-bold">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Privacy & Security Modal Button */}
          <button
            onClick={onOpenSecurity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-sm"
            title="View Security & Privacy Standards"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Privacy Verified</span>
          </button>
        </div>
      </div>
    </header>
  );
}
