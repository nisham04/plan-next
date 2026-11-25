import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Coffee,
  Sun,
  Moon,
  ExternalLink,
  ShieldAlert,
  UtensilsCrossed,
} from 'lucide-react';
import {
  getDaySnapshot,
  parseMealDisplay,
  buildWidgetApiUrl,
  buildWidgetPageUrl,
  buildScriptableCode,
} from '../utils/widgetHelpers';

const MEAL_PREVIEW = [
  { key: 'Breakfast', Icon: Coffee, color: '#d4b45d' },
  { key: 'Lunch', Icon: Sun, color: '#6e786e' },
  { key: 'Dinner', Icon: Moon, color: '#9c7b6b' },
];

export default function WidgetBuilderModal({ isOpen, onClose, plan, user, appTheme }) {
  const [platformTab, setPlatformTab] = useState('ios'); // 'ios' | 'android' | 'shortcut'
  const [widgetTheme, setWidgetTheme] = useState(appTheme === 'light' ? 'light' : 'dark');
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  }, []);

  const today = useMemo(() => getDaySnapshot(plan, 0), [plan]);
  const tomorrow = useMemo(() => getDaySnapshot(plan, 1), [plan]);

  const widgetPageUrl = useMemo(
    () => buildWidgetPageUrl({ origin, theme: widgetTheme, showTomorrow }),
    [origin, widgetTheme, showTomorrow]
  );

  const widgetApiUrl = useMemo(
    () =>
      buildWidgetApiUrl({
        origin,
        uid: user?.uid || '',
        refreshToken: user?.refreshToken || '',
        timeZone,
      }),
    [origin, user?.uid, user?.refreshToken, timeZone]
  );

  const scriptableCode = useMemo(
    () =>
      buildScriptableCode({
        uid: user?.uid || '',
        refreshToken: user?.refreshToken || '',
        firebaseApiKey: 'AIzaSyAOzc2-bdVB1rFqatE8QTY_iraM2xuyaN8',
        projectId: 'planbite-c7a2d',
        appUrl: origin,
        theme: widgetTheme,
        showTomorrow,
      }),
    [user?.uid, user?.refreshToken, origin, widgetTheme, showTomorrow]
  );

  const handleCopy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      // Fallback copy
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-box widget-builder-modal"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Smartphone size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ margin: 0 }}>Phone Home Widget</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    Today&apos;s Meals from PlanBite
                  </p>
                </div>
              </div>
              <button type="button" className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="widget-modal-body">
              {/* Live Widget Preview */}
              <div className={`widget-preview-card ${widgetTheme === 'light' ? 'light' : 'dark'}`}>
                <div className="widget-preview-top">
                  <span className="widget-preview-brand">PLANBITE</span>
                  <span className="widget-preview-date">{today.dateLabel}</span>
                </div>
                <div className="widget-preview-rows">
                  {MEAL_PREVIEW.map((meal) => {
                    const MealIcon = meal.Icon;
                    const parsed = parseMealDisplay(today.meals[meal.key]);
                    return (
                      <div key={meal.key} className="widget-preview-row">
                        <span className="widget-preview-lbl" style={{ color: meal.color }}>
                          <MealIcon size={13} />
                          {meal.key}
                        </span>
                        <span className="widget-preview-val">
                          {parsed.isEmpty ? (
                            <span style={{ opacity: 0.45 }}>Not planned</span>
                          ) : parsed.isEatingOut ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <UtensilsCrossed size={11} />
                              {parsed.items[0]}
                            </span>
                          ) : (
                            parsed.items.join(', ')
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {showTomorrow && (
                  <div className="widget-preview-tomorrow">
                    Tomorrow ({tomorrow.dayName.slice(0, 3)}):{' '}
                    {tomorrow.meals.Breakfast
                      ? parseMealDisplay(tomorrow.meals.Breakfast).items.join(', ')
                      : 'Not planned'}
                  </div>
                )}
              </div>

              {/* Simple Customization Controls */}
              <div className="widget-controls-row">
                <div className="widget-control-group">
                  <span className="widget-control-label">Widget Theme</span>
                  <div className="widget-pill-switch">
                    <button
                      type="button"
                      className={widgetTheme === 'dark' ? 'active' : ''}
                      onClick={() => setWidgetTheme('dark')}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      className={widgetTheme === 'light' ? 'active' : ''}
                      onClick={() => setWidgetTheme('light')}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <label className="widget-toggle-label">
                  <input
                    type="checkbox"
                    checked={showTomorrow}
                    onChange={(e) => setShowTomorrow(e.target.checked)}
                  />
                  <span>Show tomorrow&apos;s breakfast</span>
                </label>
              </div>

              {/* Platform Method Tabs */}
              <div className="widget-platform-tabs">
                <button
                  type="button"
                  className={`widget-tab-btn ${platformTab === 'ios' ? 'active' : ''}`}
                  onClick={() => setPlatformTab('ios')}
                >
                  iPhone (Scriptable)
                </button>
                <button
                  type="button"
                  className={`widget-tab-btn ${platformTab === 'android' ? 'active' : ''}`}
                  onClick={() => setPlatformTab('android')}
                >
                  Android (KWGT)
                </button>
                <button
                  type="button"
                  className={`widget-tab-btn ${platformTab === 'shortcut' ? 'active' : ''}`}
                  onClick={() => setPlatformTab('shortcut')}
                >
                  Quick Pin
                </button>
              </div>

              {platformTab === 'ios' && (
                <div className="widget-instructions-box">
                  <ol className="widget-steps-list">
                    <li>Install the free <strong>Scriptable</strong> app on your iPhone.</li>
                    <li>Tap <strong>Copy iOS Widget Script</strong> below and paste it into a new Scriptable script.</li>
                    <li>Long-press your iPhone Home Screen → <strong>+</strong> → <strong>Scriptable (Medium)</strong> → select the script.</li>
                  </ol>
                  <button
                    type="button"
                    className="widget-primary-action"
                    onClick={() => handleCopy('scriptable', scriptableCode)}
                  >
                    {copiedKey === 'scriptable' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'scriptable' ? 'Scriptable Code Copied!' : 'Copy iOS Widget Script'}</span>
                  </button>
                </div>
              )}

              {platformTab === 'android' && (
                <div className="widget-instructions-box">
                  <ol className="widget-steps-list">
                    <li>Install <strong>KWGT</strong> on Android and place a blank KWGT widget on your home screen.</li>
                    <li>Copy the <strong>Live Widget JSON URL</strong> below and use these KWGT text formulas:</li>
                  </ol>
                  <div className="widget-formula-list">
                    <code>{`$wg("${widgetApiUrl}", json, .meals.Breakfast)$`}</code>
                    <code>{`$wg("${widgetApiUrl}", json, .meals.Lunch)$`}</code>
                    <code>{`$wg("${widgetApiUrl}", json, .meals.Dinner)$`}</code>
                  </div>
                  <button
                    type="button"
                    className="widget-primary-action"
                    onClick={() => handleCopy('kwgt', widgetApiUrl)}
                  >
                    {copiedKey === 'kwgt' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedKey === 'kwgt' ? 'Widget URL Copied!' : 'Copy Live Widget JSON URL'}</span>
                  </button>
                </div>
              )}

              {platformTab === 'shortcut' && (
                <div className="widget-instructions-box">
                  <ol className="widget-steps-list">
                    <li>Open the compact <strong>Today&apos;s Meals</strong> card view below.</li>
                    <li>In Chrome/Safari tap <strong>Add to Home Screen</strong> (or long-press your installed PlanNext icon → <strong>Today&apos;s Meals</strong>).</li>
                  </ol>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="widget-primary-action"
                      style={{ flex: 1 }}
                      onClick={() => {
                        window.location.href = widgetPageUrl;
                      }}
                    >
                      <ExternalLink size={16} />
                      <span>Open Widget View</span>
                    </button>
                    <button
                      type="button"
                      className="widget-secondary-action"
                      onClick={() => handleCopy('url', widgetPageUrl)}
                    >
                      {copiedKey === 'url' ? <Check size={15} /> : <Copy size={15} />}
                      <span>{copiedKey === 'url' ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}

              {(platformTab === 'ios' || platformTab === 'android') && (
                <div className="widget-privacy-note">
                  <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    Keep your copied script/URL private—it contains your personal account refresh token so the widget can read your meals without asking you to log in every time.
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
