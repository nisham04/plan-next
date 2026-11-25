import React, { useState } from 'react';
import { useCardContext } from '../../context/CardContext';
import VisualCard from './VisualCard';
import CardFormModal from './CardFormModal';
import DeleteCardModal from './DeleteCardModal';
import { Plus, Search, CreditCard, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function CardsView({ onNavigateToOffersWithCard }) {
  const {
    cards,
    offers,
    rewards,
    addCard,
    updateCard,
    deleteCard,
    getCardCascadeInfo,
    resetToSampleData,
  } = useCardContext();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'credit' | 'debit'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCascadeInfo, setDeleteCascadeInfo] = useState(null);

  // Filter cards by type and search query
  const filteredCards = cards.filter((card) => {
    const matchesTab =
      activeTab === 'all' ? true : card.cardType === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      card.cardName.toLowerCase().includes(q) ||
      card.bankName.toLowerCase().includes(q) ||
      card.lastFour.includes(q);
    return matchesTab && matchesSearch;
  });

  const creditCount = cards.filter((c) => c.cardType === 'credit').length;
  const debitCount = cards.filter((c) => c.cardType === 'debit').length;

  const handleOpenAdd = () => {
    setEditingCard(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setIsAddEditModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingCard) {
      updateCard(editingCard.id, formData);
    } else {
      addCard(formData);
    }
  };

  const handleOpenDelete = (cardId) => {
    const info = getCardCascadeInfo(cardId);
    setDeleteCascadeInfo(info);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteCascadeInfo && deleteCascadeInfo.card) {
      deleteCard(deleteCascadeInfo.card.id);
      setIsDeleteModalOpen(false);
      setDeleteCascadeInfo(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Cards ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'credit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Credit ({creditCount})
          </button>
          <button
            onClick={() => setActiveTab('debit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'debit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Debit ({debitCount})
          </button>
        </div>

        {/* Search & Add Action */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bank, card, or last 4..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all shadow-lg shadow-indigo-600/30 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => {
            const cardOffers = offers.filter((o) => o.cardId === card.id);
            const cardReward = rewards.find((r) => r.cardId === card.id);
            return (
              <VisualCard
                key={card.id}
                card={card}
                offersCount={cardOffers.length}
                reward={cardReward}
                onEdit={() => handleOpenEdit(card)}
                onDelete={() => handleOpenDelete(card.id)}
                onViewOffers={() => onNavigateToOffersWithCard && onNavigateToOffersWithCard(card.id)}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {searchQuery ? 'No matching cards found' : 'No cards in your vault yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {searchQuery
              ? `No results for "${searchQuery}". Try searching by another keyword.`
              : 'Add your credit and debit cards to track categorized offers, reward points, and cash redemption values.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Card</span>
            </button>
            <button
              onClick={resetToSampleData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <CardFormModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialCard={editingCard}
      />

      {/* Cascade Delete Safety Modal */}
      <DeleteCardModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        cascadeInfo={deleteCascadeInfo}
      />
    </div>
  );
}
