import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { OFFER_CATEGORIES } from '../../types/cardTypes';
import { Tag, AlertCircle, CheckSquare } from 'lucide-react';

export default function OfferFormModal({
  isOpen,
  onClose,
  onSubmit,
  cards,
  initialOffer = null,
  preselectedCardId = null,
}) {
  const isEditing = Boolean(initialOffer);

  const [formData, setFormData] = useState({
    cardId: '',
    category: 'Dining',
    description: '',
    isUsed: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialOffer) {
      setFormData({
        cardId: initialOffer.cardId || '',
        category: initialOffer.category || 'Dining',
        description: initialOffer.description || '',
        isUsed: Boolean(initialOffer.isUsed),
      });
    } else {
      // Pick preselected card or first available card
      const defaultCardId = preselectedCardId || (cards.length > 0 ? cards[0].id : '');
      setFormData({
        cardId: defaultCardId,
        category: 'Dining',
        description: '',
        isUsed: false,
      });
    }
    setErrors({});
  }, [initialOffer, preselectedCardId, cards, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.cardId) {
      newErrors.cardId = 'Please select a card for this offer';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Offer description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Offer' : 'Add New Offer'}
      subtitle="Link a promotional discount, cashback or perk to a specific card."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Linked Card Selection (Foreign Key by Card ID) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Linked Card *
          </label>
          {cards.length > 0 ? (
            <select
              value={formData.cardId}
              onChange={(e) => handleChange('cardId', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                errors.cardId ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-amber-500/40'
              }`}
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bankName} — {c.cardName} (•••• {c.lastFour}) [{c.cardType.toUpperCase()}]
                </option>
              ))}
            </select>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs">
              No cards found in your vault. Please add a card first before adding offers.
            </div>
          )}
          {errors.cardId && (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.cardId}</span>
            </p>
          )}
        </div>

        {/* Offer Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Category *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OFFER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all truncate ${
                  formData.category === cat
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Offer Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            Offer Description *
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="e.g. 10% instant discount on grocery orders up to $25, valid until month end"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.description ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-amber-500/40'
            }`}
          />
          {errors.description && (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.description}</span>
            </p>
          )}
        </div>

        {/* "Is Used" Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={formData.isUsed}
              onChange={(e) => handleChange('isUsed', e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-white block">Mark as Used</span>
              <span className="text-xs text-slate-400">
                Keep track of redeemed offers so you know which discounts have already been claimed.
              </span>
            </div>
          </label>
        </div>

        {/* Modal Actions */}
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
            disabled={cards.length === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/30"
          >
            {isEditing ? 'Save Offer' : 'Add Offer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
