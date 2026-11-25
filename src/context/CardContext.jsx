import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_CARDS, SAMPLE_OFFERS, SAMPLE_REWARDS } from '../data/sampleData';

const CardContext = createContext(null);

const STORAGE_KEYS = {
  CARDS: 'cardvault_cards_v1',
  OFFERS: 'cardvault_offers_v1',
  REWARDS: 'cardvault_rewards_v1',
};

export function CardProvider({ children }) {
  // 1. Initial State from LocalStorage or Fictional Sample Data
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : SAMPLE_CARDS;
    } catch (e) {
      console.error('Failed reading cards from localStorage:', e);
      return SAMPLE_CARDS;
    }
  });

  const [offers, setOffers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFERS);
      return saved ? JSON.parse(saved) : SAMPLE_OFFERS;
    } catch (e) {
      console.error('Failed reading offers from localStorage:', e);
      return SAMPLE_OFFERS;
    }
  });

  const [rewards, setRewards] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REWARDS);
      return saved ? JSON.parse(saved) : SAMPLE_REWARDS;
    } catch (e) {
      console.error('Failed reading rewards from localStorage:', e);
      return SAMPLE_REWARDS;
    }
  });

  // 2. Persist to LocalStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed saving cards to localStorage:', e);
    }
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
    } catch (e) {
      console.error('Failed saving offers to localStorage:', e);
    }
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
    } catch (e) {
      console.error('Failed saving rewards to localStorage:', e);
    }
  }, [rewards]);

  // 3. Card Operations
  /**
   * Adds a new card and AUTOMATICALLY creates a corresponding 1:1 reward record.
   */
  const addCard = (cardData) => {
    const newCardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newCard = {
      id: newCardId,
      cardType: cardData.cardType || 'credit',
      cardName: cardData.cardName.trim(),
      bankName: cardData.bankName.trim(),
      lastFour: String(cardData.lastFour).trim().slice(-4),
      network: cardData.network || 'Visa',
      expiryMonth: cardData.expiryMonth || '12',
      expiryYear: cardData.expiryYear || '28',
      colorTheme: cardData.colorTheme || 'midnight',
      createdAt: new Date().toISOString(),
    };

    // Automatic 1:1 Reward record creation
    const newReward = {
      cardId: newCardId,
      currentRewardPoints: Number(cardData.initialRewardPoints || 0),
      minRedemptionPoints: Number(cardData.minRedemptionPoints || 1000),
      valuePerPoint: Number(cardData.valuePerPoint || 0.01),
      isVisible: true,
      updatedAt: new Date().toISOString(),
    };

    setCards((prev) => [newCard, ...prev]);
    setRewards((prev) => [newReward, ...prev]);
    return newCard;
  };

  /**
   * Updates an existing card's details.
   * Notice: Offers and Rewards reference cardId, so card name/bank updates
   * automatically propagate reactively everywhere.
   */
  const updateCard = (cardId, updates) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          ...updates,
          cardName: updates.cardName ? updates.cardName.trim() : c.cardName,
          bankName: updates.bankName ? updates.bankName.trim() : c.bankName,
          lastFour: updates.lastFour ? String(updates.lastFour).trim().slice(-4) : c.lastFour,
        };
      })
    );
  };

  /**
   * Retrieves cascade deletion impact info before deletion.
   */
  const getCardCascadeInfo = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    const linkedOffers = offers.filter((o) => o.cardId === cardId);
    const rewardRecord = rewards.find((r) => r.cardId === cardId);
    return {
      card,
      offersCount: linkedOffers.length,
      linkedOffers,
      hasReward: Boolean(rewardRecord),
      rewardRecord,
    };
  };

  /**
   * Cascade-deletes a card and its associated offers and reward record.
   */
  const deleteCard = (cardId) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setOffers((prev) => prev.filter((o) => o.cardId !== cardId));
    setRewards((prev) => prev.filter((r) => r.cardId !== cardId));
  };

  // 4. Offer Operations
  const addOffer = ({ cardId, category, description, isUsed = false }) => {
    const newOffer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      cardId,
      category: category || 'General',
      description: description.trim(),
      isUsed: Boolean(isUsed),
      createdAt: new Date().toISOString(),
    };
    setOffers((prev) => [newOffer, ...prev]);
    return newOffer;
  };

  const updateOffer = (offerId, updates) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, ...updates } : o))
    );
  };

  const toggleOfferUsed = (offerId) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, isUsed: !o.isUsed } : o))
    );
  };

  const deleteOffer = (offerId) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  // 5. Reward Operations
  const updateReward = (cardId, updates) => {
    setRewards((prev) => {
      const exists = prev.some((r) => r.cardId === cardId);
      if (exists) {
        return prev.map((r) =>
          r.cardId === cardId
            ? {
                ...r,
                ...updates,
                currentRewardPoints: updates.currentRewardPoints !== undefined ? Number(updates.currentRewardPoints) : r.currentRewardPoints,
                minRedemptionPoints: updates.minRedemptionPoints !== undefined ? Number(updates.minRedemptionPoints) : r.minRedemptionPoints,
                valuePerPoint: updates.valuePerPoint !== undefined ? Number(updates.valuePerPoint) : r.valuePerPoint,
                updatedAt: new Date().toISOString(),
              }
            : r
        );
      } else {
        // Fallback: If missing for any reason, add exactly one reward record
        return [
          {
            cardId,
            currentRewardPoints: Number(updates.currentRewardPoints || 0),
            minRedemptionPoints: Number(updates.minRedemptionPoints || 1000),
            valuePerPoint: Number(updates.valuePerPoint || 0.01),
            isVisible: updates.isVisible !== undefined ? updates.isVisible : true,
            updatedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });
  };

  const toggleRewardVisibility = (cardId) => {
    setRewards((prev) =>
      prev.map((r) => (r.cardId === cardId ? { ...r, isVisible: !r.isVisible } : r))
    );
  };

  // 6. Lookups & Joins
  const getCardById = (cardId) => cards.find((c) => c.id === cardId);
  const getOffersByCardId = (cardId) => offers.filter((o) => o.cardId === cardId);
  const getRewardByCardId = (cardId) => rewards.find((r) => r.cardId === cardId);

  // 7. Reset / Clear / Export
  const resetToSampleData = () => {
    setCards(SAMPLE_CARDS);
    setOffers(SAMPLE_OFFERS);
    setRewards(SAMPLE_REWARDS);
  };

  const clearAllData = () => {
    setCards([]);
    setOffers([]);
    setRewards([]);
  };

  const exportDataJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      cards,
      offers,
      rewards,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.cards) && Array.isArray(parsed.offers) && Array.isArray(parsed.rewards)) {
        setCards(parsed.cards);
        setOffers(parsed.offers);
        setRewards(parsed.rewards);
        return { success: true, message: 'Data successfully restored!' };
      }
      return { success: false, message: 'Invalid data format. File must contain cards, offers, and rewards.' };
    } catch (e) {
      return { success: false, message: 'JSON parsing failed: ' + e.message };
    }
  };

  // 8. Aggregate Portfolio Calculations
  const visibleRewards = rewards.filter((r) => r.isVisible);
  const totalRewardPoints = visibleRewards.reduce((sum, r) => sum + (Number(r.currentRewardPoints) || 0), 0);
  const totalRewardValue = visibleRewards.reduce(
    (sum, r) => sum + (Number(r.currentRewardPoints) || 0) * (Number(r.valuePerPoint) || 0),
    0
  );
  const readyForRedemptionCount = visibleRewards.filter(
    (r) => Number(r.currentRewardPoints) >= Number(r.minRedemptionPoints) && Number(r.minRedemptionPoints) > 0
  ).length;

  return (
    <CardContext.Provider
      value={{
        cards,
        offers,
        rewards,
        addCard,
        updateCard,
        deleteCard,
        getCardCascadeInfo,
        addOffer,
        updateOffer,
        toggleOfferUsed,
        deleteOffer,
        updateReward,
        toggleRewardVisibility,
        getCardById,
        getOffersByCardId,
        getRewardByCardId,
        resetToSampleData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        // Metrics
        totalRewardPoints,
        totalRewardValue,
        readyForRedemptionCount,
      }}
    >
      {children}
    </CardContext.Provider>
  );
}

export function useCardContext() {
  const context = useContext(CardContext);
  if (!context) {
    throw new Error('useCardContext must be used within a CardProvider');
  }
  return context;
}
