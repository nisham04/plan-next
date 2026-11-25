import React from 'react';
import { CARD_THEMES } from '../../types/cardTypes';
import { CreditCard, Edit2, Trash2, Wifi, Sparkles, Tag, Gift } from 'lucide-react';
import Badge from '../common/Badge';

export default function VisualCard({
  card,
  offersCount = 0,
  reward = null,
  onEdit,
  onDelete,
  onViewOffers,
}) {
  const theme = CARD_THEMES.find((t) => t.id === card.colorTheme) || CARD_THEMES[0];
  const isCredit = card.cardType === 'credit';

  return (
    <div className="relative group perspective-1000">
      {/* 3D Glassmorphism Credit/Debit Card Surface */}
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${theme.gradient} p-5 sm:p-6 text-white shadow-xl border ${theme.border} transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-2xl overflow-hidden flex flex-col justify-between select-none`}
      >
        {/* Subtle holographic overlay texture */}
        <div className="absolute inset-0 bg-radial-at-t from-white/10 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Top Header Row: Bank Name + Card Type & Network */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-slate-300/80 uppercase">
              Issuing Bank
            </span>
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm truncate max-w-[180px] sm:max-w-[220px]">
              {card.bankName}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isCredit
                  ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
                  : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
              }`}
            >
              {isCredit ? 'Credit' : 'Debit'}
            </span>
            <span className="text-xs font-extrabold tracking-wide uppercase px-2 py-0.5 rounded bg-black/30 text-white/90 border border-white/10">
              {card.network || 'Card'}
            </span>
          </div>
        </div>

        {/* Middle Row: Chip + Contactless Wave */}
        <div className="relative z-10 flex items-center gap-3 my-auto">
          {/* EMV Chip Simulation */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/40 shadow-inner flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 border border-amber-600/30 rounded" />
            <div className="w-full h-[1px] bg-amber-700/30" />
            <div className="h-full w-[1px] bg-amber-700/30 absolute" />
          </div>
          <Wifi className="w-5 h-5 text-slate-300/80 rotate-90" />
        </div>

        {/* Card Number Mask: Strictly last 4 digits displayed */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 font-mono text-base sm:text-xl font-bold tracking-widest text-slate-100 drop-shadow">
            <span>••••</span>
            <span>••••</span>
            <span>••••</span>
            <span className="text-white bg-white/15 px-1.5 py-0.5 rounded font-black tracking-wider">
              {card.lastFour}
            </span>
          </div>
        </div>

        {/* Bottom Row: Card Name & Expiration */}
        <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
          <div className="truncate max-w-[180px] sm:max-w-[240px]">
            <span className="text-[9px] uppercase tracking-wider text-slate-300/80 block">
              Cardholder / Product
            </span>
            <p className="text-sm font-semibold tracking-wide text-white truncate">
              {card.cardName}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-slate-300/80 block">
              Expires
            </span>
            <p className="text-xs font-mono font-semibold text-slate-200">
              {card.expiryMonth || '12'}/{card.expiryYear || '28'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Info & Quick Actions Footer Bar */}
      <div className="mt-2.5 px-1 flex items-center justify-between text-xs text-slate-400">
        {/* Linked Offers & Reward Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onViewOffers}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 transition-colors border border-amber-500/20"
            title="View linked offers"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>
              {offersCount} {offersCount === 1 ? 'Offer' : 'Offers'}
            </span>
          </button>

          {reward && (
            <span
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-indigo-300 border border-indigo-500/20"
              title="Reward points"
            >
              <Gift className="w-3.5 h-3.5 text-indigo-400" />
              <span>{Number(reward.currentRewardPoints || 0).toLocaleString()} pts</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Edit & Cascade Delete */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:text-indigo-300 text-slate-300 border border-slate-700 transition-colors"
            title="Edit card information"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 hover:text-rose-400 text-slate-300 border border-slate-700 transition-colors"
            title="Delete card (with cascade warning)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
