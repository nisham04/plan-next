import React, { useState } from 'react';
import { useCardContext } from '../../context/CardContext';
import OfferFormModal from './OfferFormModal';
import Badge from '../common/Badge';
import { OFFER_CATEGORIES } from '../../types/cardTypes';
import {
  Tag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  CreditCard,
  Check,
} from 'lucide-react';

export default function OffersView({ initialCardId = null }) {
  const {
    cards,
    offers,
    addOffer,
    updateOffer,
    toggleOfferUsed,
    deleteOffer,
    getCardById,
  } = useCardContext();

  const [selectedCardFilter, setSelectedCardFilter] = useState(initialCardId || 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'used'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Filter offers
  const filteredOffers = offers.filter((offer) => {
    // 1. Card filter
    if (selectedCardFilter !== 'all' && offer.cardId !== selectedCardFilter) {
      return false;
    }
    // 2. Category filter
    if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
      return false;
    }
    // 3. Status filter
    if (statusFilter === 'active' && offer.isUsed) return false;
    if (statusFilter === 'used' && !offer.isUsed) return false;

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const card = getCardById(offer.cardId);
      const cardInfo = card ? `${card.bankName} ${card.cardName} ${card.lastFour}`.toLowerCase() : '';
      const matchesText =
        offer.description.toLowerCase().includes(q) ||
        offer.category.toLowerCase().includes(q) ||
        cardInfo.includes(q);
      if (!matchesText) return false;
    }

    return true;
  });

  const activeCount = offers.filter((o) => !o.isUsed).length;
  const usedCount = offers.filter((o) => o.isUsed).length;

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingOffer) {
      updateOffer(editingOffer.id, formData);
    } else {
      addOffer(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Status Filters: All, Active, Used */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Offers ({offers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('used')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'used'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Used ({usedCount})
          </button>
        </div>

        {/* Card Selector & Search & Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter by Card Dropdown */}
          <select
            value={selectedCardFilter}
            onChange={(e) => setSelectedCardFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="all">All Linked Cards</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bankName} - {c.cardName} (•••• {c.lastFour})
              </option>
            ))}
          </select>

          {/* Search Field */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offer or bank..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Add Offer Action */}
          <button
            onClick={handleOpenAdd}
            disabled={cards.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/30 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Offer</span>
          </button>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {OFFER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Offers Listing */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOffers.map((offer) => {
            const linkedCard = getCardById(offer.cardId);

            return (
              <div
                key={offer.id}
                className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  offer.isUsed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
              >
                <div>
                  {/* Top Row: Category + Card Info Tag + Actions */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="category" size="xs">
                        {offer.category}
                      </Badge>

                      {linkedCard ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700/60">
                          <CreditCard className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[140px] sm:max-w-[180px]">
                            {linkedCard.bankName} • {linkedCard.cardName}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            (•••• {linkedCard.lastFour})
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 font-mono italic">
                          [Orphaned Card ID: {offer.cardId}]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(offer)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Edit offer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteOffer(offer.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Offer Description */}
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      offer.isUsed
                        ? 'line-through text-slate-400'
                        : 'text-white font-medium'
                    }`}
                  >
                    {offer.description}
                  </p>
                </div>

                {/* Bottom Row: Usage Status Toggle Checkbox */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={offer.isUsed}
                      onChange={() => toggleOfferUsed(offer.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border ${
                        offer.isUsed
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-800 border-slate-700 group-hover:border-slate-500'
                      }`}
                    >
                      {offer.isUsed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        offer.isUsed ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {offer.isUsed ? 'Redeemed / Used' : 'Available to Use'}
                    </span>
                  </label>

                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {offer.id.slice(-6)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No offers found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {cards.length === 0
              ? 'Add a card first before saving associated merchant discounts and cashback offers.'
              : 'Add promotional offers and discounts linked to your cards to never miss a perk.'}
          </p>
          {cards.length > 0 && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Offer</span>
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      <OfferFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        cards={cards}
        initialOffer={editingOffer}
        preselectedCardId={selectedCardFilter !== 'all' ? selectedCardFilter : null}
      />
    </div>
  );
}
