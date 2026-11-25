// Card & Offer Types, Constants, and Validation Helpers

export const CARD_TYPES = [
  { id: 'credit', label: 'Credit Card', badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'debit', label: 'Debit Card', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

export const OFFER_CATEGORIES = [
  'Dining',
  'Travel',
  'Shopping',
  'Groceries',
  'Entertainment',
  'Fuel & Utilities',
  'Electronics',
  'General',
];

export const CARD_NETWORKS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'RuPay', 'Other'];

export const CARD_THEMES = [
  { id: 'midnight', name: 'Midnight Obsidian', gradient: 'from-slate-900 via-indigo-950 to-neutral-900', border: 'border-indigo-500/30', accent: '#6366f1' },
  { id: 'sapphire', name: 'Royal Sapphire', gradient: 'from-blue-900 via-sky-950 to-indigo-900', border: 'border-sky-500/30', accent: '#0284c7' },
  { id: 'emerald', name: 'Emerald Peak', gradient: 'from-emerald-950 via-teal-900 to-slate-900', border: 'border-emerald-500/30', accent: '#10b981' },
  { id: 'amethyst', name: 'Velvet Amethyst', gradient: 'from-purple-950 via-violet-900 to-neutral-900', border: 'border-purple-500/30', accent: '#a855f7' },
  { id: 'roseGold', name: 'Rose Metallic', gradient: 'from-rose-950 via-pink-900 to-amber-950', border: 'border-rose-500/30', accent: '#f43f5e' },
  { id: 'slate', name: 'Titanium Slate', gradient: 'from-zinc-900 via-stone-900 to-neutral-950', border: 'border-zinc-500/30', accent: '#71717a' },
];

/**
 * Validates strictly the last four digits of a card.
 * Full card numbers or letters are strictly rejected.
 */
export function validateLastFour(digits) {
  if (!digits) return 'Last 4 digits are required';
  const clean = String(digits).trim();
  if (!/^\d{4}$/.test(clean)) {
    return 'Must be exactly 4 digits (e.g. 4589)';
  }
  return null;
}

export function validateCardName(name) {
  if (!name || !name.trim()) return 'Card name is required';
  if (name.trim().length > 40) return 'Card name must be 40 characters or fewer';
  return null;
}

export function validateBankName(bank) {
  if (!bank || !bank.trim()) return 'Bank name is required';
  if (bank.trim().length > 40) return 'Bank name must be 40 characters or fewer';
  return null;
}

export function validatePoints(points) {
  const num = Number(points);
  if (isNaN(num) || num < 0) return 'Points must be a positive number';
  return null;
}

export function validatePointValue(val) {
  const num = Number(val);
  if (isNaN(num) || num < 0) return 'Value per point must be a non-negative number';
  return null;
}
