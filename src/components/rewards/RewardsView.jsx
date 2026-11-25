import React, { useState } from 'react';
import { useCardContext } from '../../context/CardContext';
import RewardEditModal from './RewardEditModal';
import Badge from '../common/Badge';
import {
  Gift,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Edit2,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';

export default function RewardsView() {
  const {
    rewards,
    updateReward,
    toggleRewardVisibility,
    getCardById,
    totalRewardPoints,
    totalRewardValue,
    readyForRedemptionCount,
  } = useCardContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'visible' | 'eligible'

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editingCard, setEditingCard] = useState(null);

  // Map rewards to their cards and filter
  const rewardItems = rewards.map((reward) => {
    const card = getCardById(reward.cardId);
    const points = Number(reward.currentRewardPoints) || 0;
    const minPoints = Number(reward.minRedemptionPoints) || 1;
    const valPerPoint = Number(reward.valuePerPoint) || 0.01;
    const cashValue = points * valPerPoint;
    const isEligible = points >= minPoints && minPoints > 0;
    const progressPercent = Math.min(100, Math.round((points / minPoints) * 100));
    const pointsNeeded = Math.max(0, minPoints - points);

    return {
      reward,
      card,
      points,
      minPoints,
      valPerPoint,
      cashValue,
      isEligible,
      progressPercent,
      pointsNeeded,
    };
  });

  const filteredItems = rewardItems.filter((item) => {
    // 1. Filter mode
    if (filterMode === 'visible' && !item.reward.isVisible) return false;
    if (filterMode === 'eligible' && !item.isEligible) return false;

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cardInfo = item.card
        ? `${item.card.bankName} ${item.card.cardName} ${item.card.lastFour}`.toLowerCase()
        : '';
      return cardInfo.includes(q);
    }
    return true;
  });

  const handleOpenEdit = (reward, card) => {
    setEditingReward(reward);
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleFormSubmit = (cardId, updates) => {
    updateReward(cardId, updates);
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Points */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/20 shadow-md">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Points (Visible)
            </span>
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white">
            {totalRewardPoints.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {rewards.filter((r) => r.isVisible).length} active reward programs
          </span>
        </div>

        {/* Estimated Total Cash Value */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Est. Total Cash Value
            </span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white">
            ${totalRewardValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Calculated at individual point valuations
          </span>
        </div>

        {/* Ready to Redeem Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Redemption Ready
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-black text-white">
            {readyForRedemptionCount} <span className="text-sm font-medium text-slate-400">Cards</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Met or exceeded minimum redemption thresholds
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Rewards ({rewards.length})
          </button>
          <button
            onClick={() => setFilterMode('visible')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'visible'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visible in Portfolio
          </button>
          <button
            onClick={() => setFilterMode('eligible')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'eligible'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ready to Redeem ({readyForRedemptionCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search card or bank..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Rewards Card Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map(
            ({
              reward,
              card,
              points,
              minPoints,
              valPerPoint,
              cashValue,
              isEligible,
              progressPercent,
              pointsNeeded,
            }) => {
              if (!card) return null;

              return (
                <div
                  key={reward.cardId}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    reward.isVisible
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div>
                    {/* Top Header: Card Identity + Actions */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              card.cardType === 'credit'
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {card.cardType}
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-400">
                            •••• {card.lastFour}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white tracking-tight">
                          {card.cardName}
                        </h4>
                        <p className="text-xs text-slate-400">{card.bankName}</p>
                      </div>

                      {/* Header Actions: Visibility toggle + Edit */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleRewardVisibility(reward.cardId)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            reward.isVisible
                              ? 'bg-slate-800 text-indigo-400 border-slate-700 hover:bg-slate-700'
                              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                          }`}
                          title={reward.isVisible ? 'Hide from Rewards summary' : 'Show in Rewards summary'}
                        >
                          {reward.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(reward, card)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Edit point parameters"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Points & Value Metric Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Current Points
                        </span>
                        <p className="text-xl font-mono font-bold text-white mt-0.5">
                          {points.toLocaleString()}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          @ ${valPerPoint} / pt
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Est. Cash Value
                        </span>
                        <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                          ${cashValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          Redemption Value
                        </span>
                      </div>
                    </div>

                    {/* Progress to Minimum Threshold */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">
                          Min. Redemption Threshold:
                        </span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {minPoints.toLocaleString()} pts
                        </span>
                      </div>

                      {/* Progress Track */}
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isEligible
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    {isEligible ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Eligible for Redemption 🎉</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Needs {pointsNeeded.toLocaleString()} more pts</span>
                      </span>
                    )}

                    <span className="text-[10px] font-mono text-slate-500">
                      {progressPercent}% Met
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No reward records found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Whenever a card is added, a 1:1 reward record is automatically provisioned for tracking and redemption calculations.
          </p>
        </div>
      )}

      {/* Edit Reward Parameters Modal */}
      <RewardEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleFormSubmit}
        reward={editingReward}
        card={editingCard}
      />
    </div>
  );
}
