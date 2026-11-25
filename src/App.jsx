import React, { useState } from 'react';
import { CardProvider, useCardContext } from './context/CardContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import CardsView from './components/cards/CardsView';
import OffersView from './components/offers/OffersView';
import RewardsView from './components/rewards/RewardsView';
import SecurityModal from './components/security/SecurityModal';
import { ShieldCheck, Info, Sparkles, RefreshCw, Lock } from 'lucide-react';

function MainApp() {
  const {
    cards,
    offers,
    totalRewardValue,
    readyForRedemptionCount,
    resetToSampleData,
  } = useCardContext();

  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'offers' | 'rewards'
  const [selectedCardForOffers, setSelectedCardForOffers] = useState(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const handleNavigateToOffers = (cardId) => {
    setSelectedCardForOffers(cardId);
    setActiveTab('offers');
  };

  const handleSelectTab = (tabId) => {
    if (tabId !== 'offers') {
      setSelectedCardForOffers(null);
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-[#0a0c12] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Header */}
      <Header
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        totalCards={cards.length}
        totalOffers={offers.length}
        totalValue={totalRewardValue}
      />

      {/* Primary Tab Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        cardsCount={cards.length}
        offersCount={offers.length}
        readyCount={readyForRedemptionCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Security & Zero-Trust Architecture Reminder Banner */}
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900/60 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white">Zero-Knowledge Vault: </span>
              Only last 4 digits stored. Never asks for full card numbers, CVVs, PINs, or bank passwords. All data stored locally on your device.
            </div>
          </div>

          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 whitespace-nowrap pl-9 sm:pl-0 transition-colors"
          >
            <span>Learn More & Backup</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Dynamic Views */}
        {activeTab === 'cards' && (
          <CardsView onNavigateToOffersWithCard={handleNavigateToOffers} />
        )}

        {activeTab === 'offers' && (
          <OffersView initialCardId={selectedCardForOffers} />
        )}

        {activeTab === 'rewards' && (
          <RewardsView />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#0c0e15] py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CardVault Personal Privacy & Security Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Security Policy
            </button>
            <span>•</span>
            <button
              onClick={() => {
                if (window.confirm('Reset vault data to fictional demo cards and offers?')) {
                  resetToSampleData();
                }
              }}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Global Security Policy & Backup Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <CardProvider>
      <MainApp />
    </CardProvider>
  );
}
