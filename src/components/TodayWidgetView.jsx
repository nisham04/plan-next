import React from 'react';
import { Coffee, Sun, Moon, UtensilsCrossed, ExternalLink, SlidersHorizontal, RotateCw } from 'lucide-react';
import { getDaySnapshot, parseMealDisplay } from '../utils/widgetHelpers';

const MEAL_META = [
  { key: 'Breakfast', Icon: Coffee, color: '#d4b45d' },
  { key: 'Lunch', Icon: Sun, color: '#6e786e' },
  { key: 'Dinner', Icon: Moon, color: '#9c7b6b' },
];

export default function TodayWidgetView({
  plan,
  theme,
  showTomorrow = false,
  isSyncing = false,
  onOpenCustomizer,
  onOpenFullApp,
}) {
  const today = getDaySnapshot(plan, 0);
  const tomorrow = showTomorrow ? getDaySnapshot(plan, 1) : null;
  const filledCount = MEAL_META.filter((m) => !parseMealDisplay(today.meals[m.key]).isEmpty).length;

  return (
    <div className="widget-standalone-shell" data-widget-theme={theme}>
      <div className="widget-standalone-card">
        <div className="widget-card-header">
          <div className="widget-brand-row">
            <img src="/app-icon.png" alt="PlanNext" className="widget-brand-icon" />
            <div>
              <div className="widget-eyebrow">PLANBITE · TODAY</div>
              <h1 className="widget-date-title">{today.dateLabel}</h1>
            </div>
          </div>
          <div className="widget-header-actions">
            {isSyncing && <RotateCw size={14} className="animate-spin widget-sync-icon" />}
            <span className="widget-count-pill">{filledCount}/3</span>
          </div>
        </div>

        <div className="widget-meals-list">
          {MEAL_META.map((meal) => {
            const MealIcon = meal.Icon;
            const parsed = parseMealDisplay(today.meals[meal.key]);
            return (
              <div key={meal.key} className="widget-meal-row">
                <div className="widget-meal-label" style={{ color: meal.color }}>
                  <MealIcon size={15} />
                  <span>{meal.key}</span>
                </div>
                <div className="widget-meal-value">
                  {parsed.isEmpty ? (
                    <span className="widget-meal-empty">Not planned yet</span>
                  ) : parsed.isEatingOut ? (
                    <span className="widget-eating-out-pill">
                      <UtensilsCrossed size={12} />
                      <span>{parsed.items[0]}</span>
                    </span>
                  ) : (
                    <div className="widget-meal-pills">
                      {parsed.items.map((item, idx) => (
                        <span key={idx} className="widget-dish-pill">{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tomorrow && (
          <div className="widget-tomorrow-bar">
            <span className="widget-tomorrow-label">Tomorrow ({tomorrow.dayName.slice(0, 3)})</span>
            <span className="widget-tomorrow-value">
              {tomorrow.meals.Breakfast
                ? parseMealDisplay(tomorrow.meals.Breakfast).items.join(', ')
                : 'No breakfast planned'}
            </span>
          </div>
        )}

        <div className="widget-card-footer">
          <button type="button" className="widget-footer-btn" onClick={onOpenCustomizer}>
            <SlidersHorizontal size={14} />
            <span>Phone Widget Setup</span>
          </button>
          <button type="button" className="widget-footer-btn primary" onClick={onOpenFullApp}>
            <span>Open PlanNext</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
