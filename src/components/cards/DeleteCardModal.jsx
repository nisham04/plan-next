import React from 'react';
import Modal from '../common/Modal';
import { AlertTriangle, Trash2, Tag, Gift } from 'lucide-react';

export default function DeleteCardModal({
  isOpen,
  onClose,
  onConfirm,
  cascadeInfo,
}) {
  if (!cascadeInfo || !cascadeInfo.card) return null;

  const { card, offersCount, linkedOffers, hasReward, rewardRecord } = cascadeInfo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Card Confirmation"
      subtitle="This action will permanently delete this card and cascade to associated data."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Warning Callout */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-white mb-0.5">Cascade Deletion Warning</h4>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              Deleting this card will permanently remove all of its associated offers and its reward record. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Card Snapshot */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
            Target Card
          </span>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">{card.cardName}</p>
              <p className="text-xs text-slate-400">
                {card.bankName} • <span className="font-mono text-slate-300">•••• {card.lastFour}</span>
              </p>
            </div>
            <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {card.cardType}
            </span>
          </div>
        </div>

        {/* Cascading Deletions Summary */}
        <div className="space-y-2 text-xs">
          <p className="font-semibold text-slate-300">Items that will also be permanently removed:</p>

          {/* Offers list */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium text-amber-400">
                <Tag className="w-3.5 h-3.5" />
                <span>Associated Offers ({offersCount})</span>
              </span>
            </div>
            {offersCount > 0 ? (
              <ul className="space-y-1 text-slate-400 pl-4 list-disc max-h-24 overflow-y-auto">
                {linkedOffers.map((o) => (
                  <li key={o.id} className="truncate">
                    <span className="font-semibold text-slate-300">[{o.category}]</span> {o.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No offers currently attached to this card.</p>
            )}
          </div>

          {/* Reward record */}
          {hasReward && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-indigo-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Gift className="w-3.5 h-3.5 text-indigo-400" />
                <span>Associated Reward Record</span>
              </span>
              <span className="font-mono font-bold text-white">
                {Number(rewardRecord.currentRewardPoints || 0).toLocaleString()} pts
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-lg shadow-rose-600/30"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm & Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
