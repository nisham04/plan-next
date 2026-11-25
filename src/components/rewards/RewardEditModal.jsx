import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { validatePoints, validatePointValue } from '../../types/cardTypes';
import { Gift, AlertCircle, DollarSign, Eye, EyeOff } from 'lucide-react';

export default function RewardEditModal({
  isOpen,
  onClose,
  onSubmit,
  reward,
  card,
}) {
  const [formData, setFormData] = useState({
    currentRewardPoints: 0,
    minRedemptionPoints: 1000,
    valuePerPoint: 0.01,
    isVisible: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reward) {
      setFormData({
        currentRewardPoints: reward.currentRewardPoints ?? 0,
        minRedemptionPoints: reward.minRedemptionPoints ?? 1000,
        valuePerPoint: reward.valuePerPoint ?? 0.01,
        isVisible: reward.isVisible ?? true,
      });
    }
    setErrors({});
  }, [reward, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const pointsErr = validatePoints(formData.currentRewardPoints);
    const minErr = validatePoints(formData.minRedemptionPoints);
    const valErr = validatePointValue(formData.valuePerPoint);

    if (pointsErr) newErrors.currentRewardPoints = pointsErr;
    if (minErr) newErrors.minRedemptionPoints = minErr;
    if (valErr) newErrors.valuePerPoint = valErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(reward.cardId, formData);
    onClose();
  };

  const calculatedValue =
    (Number(formData.currentRewardPoints) || 0) * (Number(formData.valuePerPoint) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Reward Parameters"
      subtitle={card ? `${card.bankName} — ${card.cardName} (•••• ${card.lastFour})` : 'Reward Settings'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calculated Cash Value Preview Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">
              Estimated Total Cash Value
            </span>
            <p className="text-xl font-mono font-extrabold text-white mt-0.5">
              ${calculatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Current Reward Points */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Current Reward Points *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.currentRewardPoints}
            onChange={(e) => handleChange('currentRewardPoints', e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm font-mono text-white focus:outline-none focus:ring-2 transition-all ${
              errors.currentRewardPoints
                ? 'border-rose-500 focus:ring-rose-500/40'
                : 'border-slate-700 focus:ring-indigo-500/40'
            }`}
          />
          {errors.currentRewardPoints && (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.currentRewardPoints}</span>
            </p>
          )}
        </div>

        {/* Minimum Redemption Points */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Minimum Redemption Threshold (Points) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.minRedemptionPoints}
            onChange={(e) => handleChange('minRedemptionPoints', e.target.value)}
            placeholder="e.g. 5000"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm font-mono text-white focus:outline-none focus:ring-2 transition-all ${
              errors.minRedemptionPoints
                ? 'border-rose-500 focus:ring-rose-500/40'
                : 'border-slate-700 focus:ring-indigo-500/40'
            }`}
          />
          {errors.minRedemptionPoints ? (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.minRedemptionPoints}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Points required before points can be converted or redeemed.
            </p>
          )}
        </div>

        {/* Value Per Reward Point */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Monetary Value Per Point ($) *
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            value={formData.valuePerPoint}
            onChange={(e) => handleChange('valuePerPoint', e.target.value)}
            placeholder="e.g. 0.01 for 1 cent/pt, or 0.02"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm font-mono text-white focus:outline-none focus:ring-2 transition-all ${
              errors.valuePerPoint
                ? 'border-rose-500 focus:ring-rose-500/40'
                : 'border-slate-700 focus:ring-indigo-500/40'
            }`}
          />
          {errors.valuePerPoint ? (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.valuePerPoint}</span>
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Default is usually $0.01 (1 cent per point) or $0.015 - $0.02 for premium travel.
            </p>
          )}
        </div>

        {/* "Is Visible in Rewards" Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.isVisible}
              onChange={(e) => handleChange('isVisible', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                {formData.isVisible ? (
                  <>
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <span>Visible in Rewards Section</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 text-slate-500" />
                    <span>Hidden from Rewards Portfolio</span>
                  </>
                )}
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Controls whether this card's points contribute to overall portfolio totals.
              </span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/30"
          >
            Save Parameters
          </button>
        </div>
      </form>
    </Modal>
  );
}
