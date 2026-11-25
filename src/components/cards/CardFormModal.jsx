import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { CARD_THEMES, CARD_NETWORKS, validateLastFour, validateCardName, validateBankName } from '../../types/cardTypes';
import { ShieldCheck, AlertCircle, CreditCard } from 'lucide-react';

export default function CardFormModal({ isOpen, onClose, onSubmit, initialCard = null }) {
  const isEditing = Boolean(initialCard);

  const [formData, setFormData] = useState({
    cardType: 'credit',
    cardName: '',
    bankName: '',
    lastFour: '',
    network: 'Visa',
    expiryMonth: '12',
    expiryYear: '28',
    colorTheme: 'midnight',
    // Initial reward parameters (used on creation)
    initialRewardPoints: 0,
    minRedemptionPoints: 1000,
    valuePerPoint: 0.01,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialCard) {
      setFormData({
        cardType: initialCard.cardType || 'credit',
        cardName: initialCard.cardName || '',
        bankName: initialCard.bankName || '',
        lastFour: initialCard.lastFour || '',
        network: initialCard.network || 'Visa',
        expiryMonth: initialCard.expiryMonth || '12',
        expiryYear: initialCard.expiryYear || '28',
        colorTheme: initialCard.colorTheme || 'midnight',
        initialRewardPoints: 0,
        minRedemptionPoints: 1000,
        valuePerPoint: 0.01,
      });
    } else {
      setFormData({
        cardType: 'credit',
        cardName: '',
        bankName: '',
        lastFour: '',
        network: 'Visa',
        expiryMonth: '12',
        expiryYear: '28',
        colorTheme: 'midnight',
        initialRewardPoints: 0,
        minRedemptionPoints: 1000,
        valuePerPoint: 0.01,
      });
    }
    setErrors({});
  }, [initialCard, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleLastFourChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    handleChange('lastFour', raw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameErr = validateCardName(formData.cardName);
    const bankErr = validateBankName(formData.bankName);
    const lastFourErr = validateLastFour(formData.lastFour);

    const newErrors = {};
    if (nameErr) newErrors.cardName = nameErr;
    if (bankErr) newErrors.bankName = bankErr;
    if (lastFourErr) newErrors.lastFour = lastFourErr;

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
      title={isEditing ? 'Edit Card Details' : 'Add New Card'}
      subtitle={
        isEditing
          ? 'Card ID relationships will be maintained across offers and rewards.'
          : 'A dedicated reward record will automatically be provisioned for this card.'
      }
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Security Policy Reminder */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-white">Privacy Guarantee: </span>
            This application only accepts and stores the <strong>last 4 digits</strong>. Full card numbers, CVVs, PINs, or banking passwords are never requested or stored.
          </div>
        </div>

        {/* Card Type Selector: Credit vs Debit */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            Card Classification *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('cardType', 'credit')}
              className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                formData.cardType === 'credit'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Credit Card</span>
            </button>
            <button
              type="button"
              onClick={() => handleChange('cardType', 'debit')}
              className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                formData.cardType === 'debit'
                  ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Debit Card</span>
            </button>
          </div>
        </div>

        {/* Card Name and Bank Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Card / Product Name *
            </label>
            <input
              type="text"
              value={formData.cardName}
              onChange={(e) => handleChange('cardName', e.target.value)}
              placeholder="e.g. Sapphire Preferred, Millennia"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.cardName ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-indigo-500/40'
              }`}
            />
            {errors.cardName && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.cardName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Issuing Bank / Financial Institution *
            </label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="e.g. Chase, HDFC, Wells Fargo, Amex"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.bankName ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-indigo-500/40'
              }`}
            />
            {errors.bankName && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.bankName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Last 4 Digits & Payment Network */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Last 4 Digits Only *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono text-sm tracking-widest select-none">
                •••• •••• ••••
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={formData.lastFour}
                onChange={handleLastFourChange}
                placeholder="4589"
                className={`w-full pl-36 pr-3.5 py-2.5 rounded-xl bg-slate-900 border text-sm font-mono font-bold tracking-widest text-indigo-300 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  errors.lastFour ? 'border-rose-500 focus:ring-rose-500/40' : 'border-slate-700 focus:ring-indigo-500/40'
                }`}
              />
            </div>
            {errors.lastFour ? (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.lastFour}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">4 digits for identification</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Card Network
            </label>
            <select
              value={formData.network}
              onChange={(e) => handleChange('network', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {CARD_NETWORKS.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expiration Date & Visual Color Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Expiration (MM/YY)
            </label>
            <div className="flex gap-2">
              <select
                value={formData.expiryMonth}
                onChange={(e) => handleChange('expiryMonth', e.target.value)}
                className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={formData.expiryYear}
                onChange={(e) => handleChange('expiryYear', e.target.value)}
                className="w-1/2 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                {Array.from({ length: 12 }, (_, i) => String(24 + i)).map((y) => (
                  <option key={y} value={y}>
                    20{y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Card Aesthetic Style
            </label>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {CARD_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleChange('colorTheme', theme.id)}
                  className={`w-7 h-7 rounded-full bg-gradient-to-tr ${theme.gradient} border-2 transition-transform ${
                    formData.colorTheme === theme.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Auto Reward Notice when creating new card */}
        {!isEditing && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-indigo-400 block mb-1">
              ✨ Automatic Reward Provisioning
            </span>
            A reward record will automatically be initialized with 0 points. You can track points, set redemption limits, and estimate monetary value in the Rewards tab.
          </div>
        )}

        {/* Form Actions */}
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
            {isEditing ? 'Save Changes' : 'Add Card to Vault'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
