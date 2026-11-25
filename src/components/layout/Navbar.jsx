import React from 'react';
import { CreditCard, Tag, Gift } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, cardsCount, offersCount, readyCount }) {
  const tabs = [
    {
      id: 'cards',
      label: 'Cards',
      subtitle: 'Credit & Debit Vault',
      icon: CreditCard,
      badge: cardsCount,
      color: 'indigo',
    },
    {
      id: 'offers',
      label: 'Offers',
      subtitle: 'Categorized Discounts',
      icon: Tag,
      badge: offersCount,
      color: 'amber',
    },
    {
      id: 'rewards',
      label: 'Rewards',
      subtitle: 'Points & Valuations',
      icon: Gift,
      badge: readyCount > 0 ? `${readyCount} Ready` : null,
      badgeHighlight: readyCount > 0,
      color: 'emerald',
    },
  ];

  return (
    <div className="w-full bg-[#12151d] border-b border-slate-800/80 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-2 sm:gap-4 overflow-x-auto py-2.5 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-md border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? tab.color === 'indigo'
                      ? 'text-indigo-400'
                      : tab.color === 'amber'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                    : 'text-slate-500'
                }`}
              />
              <span>{tab.label}</span>

              {tab.badge !== null && tab.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    tab.badgeHighlight
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
                      : isActive
                      ? 'bg-slate-700 text-slate-200 border-slate-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
