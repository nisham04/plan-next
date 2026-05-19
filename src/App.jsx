import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { db, auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import {
  CalendarDays,
  ShoppingCart,
  ChefHat,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash,
  Trash2,
  Sparkles,
  Sun,
  Coffee,
  Moon,
  UtensilsCrossed,
  BookOpen,
  Link,
  ExternalLink,
  Tag,
  Search,
  Edit3,
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
  GripVertical,
  RotateCw,
  MoreVertical,
  LogOut,
  Mail,
  Lock,
  Video,
  Heart,
  Menu,
  Clapperboard,
  Tv,
  Film,
  MonitorPlay,
  PlayCircle,
  User,
  Globe,
  Map,
  Plane,
  Hotel,
  IndianRupee,
  Camera,
  Briefcase,
  Calendar,
  MessageSquare,
  Clock,
  ArrowDownAZ,
  Languages,
  Dumbbell,
  Activity,
} from 'lucide-react';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const MEAL_ICONS = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon };
const MEAL_COLORS = {
  Breakfast: { bg: 'var(--meal-breakfast-bg)', border: 'var(--meal-border)', text: '#a68b36', glow: 'rgba(166,139,54,0.05)' }, // Muted Gold
  Lunch: { bg: 'var(--meal-lunch-bg)', border: 'var(--meal-border)', text: '#6e786e', glow: 'rgba(110,120,110,0.05)' }, // Sage
  Dinner: { bg: 'var(--meal-dinner-bg)', border: 'var(--meal-border)', text: '#78645a', glow: 'rgba(120,100,90,0.05)' }, // Earth
};

const FIT_COLORS = { bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' };
const WORKOUT_OPTIONS = ['Full Body', 'Biceps', 'Back', 'Chest', 'Triceps', 'Shoulders', 'Leg', 'Forearms', 'Cardio', 'Football', 'Rest Day'];

const EATING_OUT_PREFIX = '🍽️ Eating Out: ';

const DEFAULT_MENU_CATEGORIES = ['Breakfast', 'Bread', 'Rice', 'Snack', 'Curry', 'Dessert'];

const CATEGORY_COLORS = {
  Breakfast: '#a68b36', Lunch: '#6e786e', Dinner: '#78645a',
  Snack: '#8c7340', Indian: '#a65d36', Italian: '#5a785a',
  Asian: '#5a7a7a', Other: '#5a5a60',
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getWeekKey(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + weekOffset * 7);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatWeekRange(weekOffset = 0) {
  const dates = getWeekDates(weekOffset);
  const s = dates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const e = dates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${s} - ${e}`;
}

function isToday(date) {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
}

function isPastDate(date) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < t;
}

function emptyWeek() {
  return DAYS.reduce((acc, d) => { acc[d] = { Breakfast: '', Lunch: '', Dinner: '' }; return acc; }, {});
}

function catColor(category) {
  return CATEGORY_COLORS[category] || '#64748b';
}

function titleCase(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getFaviconUrl(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch { return null; }
}

// â”€â”€â”€ Storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; } };
const save = () => { }; // No-op, we'll use Firestore setters

// â”€â”€â”€ Shared Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Prep your plate. Roll your screen. Pack your bags.</p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth Error:", err.code);
      if (err.code === 'auth/invalid-credential') setError('Invalid email or password');
      else if (err.code === 'auth/email-already-in-use') setError('This email is already registered');
      else if (err.code === 'auth/weak-password') setError('Password should be at least 6 characters');
      else if (err.code === 'auth/operation-not-allowed') setError('Email/Password login is not enabled in your Firebase Console.');
      else setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ChefHat size={32} />
          </div>
          <h1 className="auth-title">PlanBite</h1>
          <p className="auth-subtitle">{isSignUp ? 'Create your kitchen account' : 'Welcome back to your kitchen'}</p>
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="chef@example.com" required disabled={loading} />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" required disabled={loading} minLength={6} />
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <div className="loading-spinner-sm"></div> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="auth-footer">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="auth-toggle-btn">
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-viewport backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--modal-backdrop)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
            onClick={onClose}
          />
          {/* Bottom sheet â€” translateY only, no X transform */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32, mass: 0.8 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
            }}
            className="modal-sheet"
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button className="modal-close" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="modal-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


function FormField({ label, children }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

// â”€â”€â”€ Meal Slot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MealSlot({ meal, value, onChange, menuItems, onOpenPicker, onNavigateToBite }) {
  const [editing, setEditing] = useState(false);
  const [isEatingOut, setIsEatingOut] = useState(false);
  const [eatingOutDetails, setEatingOutDetails] = useState('');
  const [draftDishes, setDraftDishes] = useState([]);
  const colors = MEAL_COLORS[meal];
  const Icon = MEAL_ICONS[meal];

  useEffect(() => {
    if (editing) {
      if (value?.startsWith(EATING_OUT_PREFIX) && value.length > EATING_OUT_PREFIX.length) {
        setIsEatingOut(true);
        setEatingOutDetails(value.replace(EATING_OUT_PREFIX, ''));
        setDraftDishes(['']);
      } else {
        setIsEatingOut(false);
        setEatingOutDetails('');
        const valStr = value || '';
        const initial = valStr.split(',').map(d => d.trim()).filter(Boolean);
        setDraftDishes(initial.length > 0 ? initial : ['']);
      }
    }
  }, [editing, value]);

  const commit = () => {
    if (isEatingOut) {
      const detail = titleCase(eatingOutDetails.trim());
      onChange(detail ? `${EATING_OUT_PREFIX}${detail}` : '');
    } else {
      const cleaned = draftDishes.map(d => titleCase(d.trim())).filter(Boolean);
      onChange(cleaned.join(', '));
    }
    setEditing(false);
  };

  const handleDishChange = (idx, val) => {
    const updated = [...draftDishes];
    updated[idx] = val;
    setDraftDishes(updated);
  };

  const addDishField = () => setDraftDishes([...draftDishes, '']);
  const removeDishField = (idx) => {
    const updated = draftDishes.filter((_, i) => i !== idx);
    setDraftDishes(updated.length > 0 ? updated : ['']);
  };

  const isRestaurant = value?.startsWith(EATING_OUT_PREFIX) && value.trim().length > EATING_OUT_PREFIX.length;
  const dishes = value && !isRestaurant ? value.split(',').map(d => d.trim()).filter(Boolean) : [];

  return (
    <div className={`meal-slot ${isRestaurant ? 'is-eating-out' : ''}`}
      style={{ '--slot-bg': colors.bg, '--slot-border': colors.border, '--slot-text': colors.text }}>
      <div className="meal-slot-label"><Icon size={11} style={{ color: colors.text }} /><span>{meal}</span></div>
      {editing ? (
        <div className="meal-slot-input-wrap multi-input">
          {isEatingOut ? (
            <div className="meal-input-group">
              <label className="eating-out-label">Restaurant / Details</label>
              <div className="input-with-icon">
                <input className="meal-slot-input eating-out-input" value={eatingOutDetails} autoFocus
                  onChange={e => setEatingOutDetails(e.target.value)} onKeyDown={e => e.key === 'Enter' && commit()}
                  placeholder="Where are you eating?" maxLength={60} />
                <button className="inner-input-picker-btn" onClick={() => onOpenPicker({ initialMode: 'eating-out' })} title="Select from Next Bites">
                  <Star size={16} />
                </button>
              </div>
            </div>
          ) : (
            draftDishes.map((dish, idx) => {
              const suggestions = dish.length >= 1
                ? menuItems.filter(m => m.name.toLowerCase().includes(dish.toLowerCase())).slice(0, 4)
                : [];
              return (
                <div key={idx} className="meal-input-group">
                  <div className="meal-slot-input-row">
                    <input className="meal-slot-input" value={dish} autoFocus={idx === draftDishes.length - 1}
                      onChange={e => handleDishChange(idx, e.target.value)} onKeyDown={e => e.key === 'Enter' && commit()}
                      placeholder={`Add dish...`} maxLength={60} />
                    <button className="slot-action-btn picker-inline" onClick={(e) => { e.preventDefault(); onOpenPicker({ initialMode: 'menu' }); }} title="Select from saved menu">
                      <UtensilsCrossed size={14} />
                    </button>
                    {draftDishes.length > 1 && (
                      <button className="slot-action-btn delete" onClick={() => removeDishField(idx)}><Trash2 size={13} /></button>
                    )}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="meal-suggestions">
                      {suggestions.map(s => (
                        <button key={s.id} className="meal-suggestion-item" onMouseDown={() => handleDishChange(idx, s.name)}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div className="meal-slot-edit-actions">
            {!isEatingOut && <button className="btn-add-more" onClick={addDishField}><Plus size={14} /> Add item</button>}
            <button className={`btn-eating-out-toggle ${isEatingOut ? 'active' : ''}`} onClick={() => setIsEatingOut(!isEatingOut)}>
              <UtensilsCrossed size={13} /> {isEatingOut ? 'Cancel' : 'Eating Out'}
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="slot-action-btn confirm" onClick={commit}><Check size={14} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="meal-slot-display-container">
          {value?.includes('Eating Out:') ? (
            <div className="eating-out-badge-wrap">
              <div className="eating-out-badge" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Extremely robust name extraction: find the LAST colon or "Eating Out:" occurrence
                let name = '';
                if (value.includes('Eating Out:')) {
                  name = value.split('Eating Out:').pop().trim();
                } else if (value.includes(':')) {
                  name = value.split(':').pop().trim();
                } else {
                  name = value.replace(/^[^\w\s]+/, '').trim(); // Strip emojis at start
                }
                console.log("MealSlot: Clicked badge, name extracted:", name);
                onNavigateToBite(name);
              }}>
                <div className="eating-out-title-row">
                  <div className="eating-out-title">Dining Out</div>
                  <MapPin size={12} className="eating-out-link-icon" />
                </div>
                <div className="eating-out-details">{value.split(':').pop().trim()}</div>
              </div>
              <button className="eating-out-delete-btn" onClick={() => onChange('')} title="Remove or change">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button className={`meal-slot-display ${dishes.length > 0 ? 'filled' : 'empty'}`} onClick={() => setEditing(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {dishes.length > 0 ? (
                <>
                  <div className="meal-chips" style={{ flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    {dishes.map((d, i) => (
                      <span key={i} className="meal-chip">
                        {d}
                        <X size={10} className="chip-del" onMouseDown={e => { e.stopPropagation(); const nd = dishes.filter((_, idx) => idx !== i); onChange(nd.join(', ')); }} />
                      </span>
                    ))}
                  </div>
                  <div className="fit-add-btn-wrap" style={{ marginLeft: 8 }}>
                    <Plus size={18} className="fit-plus-btn-styled" />
                  </div>
                </>
              ) : (
                <div className="add-meal-field-placeholder" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Add meal</span>
                  <Plus size={18} className="fit-plus-btn-styled" />
                </div>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Day Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function DayCard({ dayName, dayDate, meals, onMealChange, menuItems, onOpenPicker, onNavigateToBite }) {
  const todayFlag = dayDate && isToday(dayDate);
  return (
    <motion.div layout className={`day-card ${todayFlag ? 'today' : ''}`}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <div className="day-header">
        <div className="day-header-left">
          <span className="day-name">{dayName}</span>
          {dayDate && <span className="day-date">{dayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
          {todayFlag && <span className="today-badge">Today</span>}
        </div>
        <div className="day-progress">
          {MEALS.map(m => <div key={m} className="progress-dot" style={{ background: meals[m] ? MEAL_COLORS[m].text : 'rgba(255,255,255,0.08)' }} />)}
        </div>
      </div>
      <div className="meal-slots">
        {MEALS.map(meal => (
          <MealSlot key={meal} meal={meal} value={meals[meal]} onChange={val => onMealChange(meal, val)} menuItems={menuItems} onOpenPicker={(extra) => onOpenPicker(meal, extra)} onNavigateToBite={onNavigateToBite} />
        ))}
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Planner Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PlannerTab({ plan, onPlanChange, menuItems, onOpenPicker, onNavigateToBite }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [pastExpanded, setPastExpanded] = useState(false);
  const weekKey = getWeekKey(weekOffset);
  const weekDates = getWeekDates(weekOffset);
  const weekData = plan[weekKey] || emptyWeek();

  const handleMealChange = (day, meal, value) => {
    onPlanChange({ ...plan, [weekKey]: { ...weekData, [day]: { ...weekData[day], [meal]: value } } });
  };

  const totalMeals = DAYS.length * MEALS.length;
  const filledMeals = DAYS.reduce((acc, d) => acc + MEALS.filter(m => weekData[d]?.[m]).length, 0);

  // Grouping into Past and Today/Upcoming
  const dayItems = DAYS.map((day, i) => ({
    key: `${weekKey}-${day}`,
    dayName: DAY_SHORT[i],
    dayId: day,
    date: weekDates[i],
    meals: weekData[day] || { Breakfast: '', Lunch: '', Dinner: '' },
    isPast: isPastDate(weekDates[i]) && !isToday(weekDates[i]),
    isToday: isToday(weekDates[i]),
  }));

  const pastDays = dayItems.filter(d => d.isPast);
  const mainDays = dayItems.filter(d => !d.isPast).sort((a, b) => (a.isToday ? -1 : 1));

  return (
    <div className="planner-tab">
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft size={18} /></button>
        <div className="week-nav-center">
          <span className="week-range">{formatWeekRange(weekOffset)}</span>
          {weekOffset !== 0 && <button className="go-today-btn" onClick={() => setWeekOffset(0)}>This Week</button>}
        </div>
        <button className="week-nav-btn" onClick={() => setWeekOffset(o => o + 1)}><ChevronRight size={18} /></button>
      </div>

      <div className="week-progress-bar">
        <div className="week-progress-fill" style={{ width: `${(filledMeals / totalMeals) * 100}%` }} />
        <span className="week-progress-label">{filledMeals}/{totalMeals} meals planned</span>
      </div>

      <div className="days-list">
        {pastDays.length > 0 && (
          <div className="past-days-section">
            <button className="past-expand-btn" onClick={() => setPastExpanded(!pastExpanded)}>
              <span>{pastExpanded ? 'Hide' : 'Show'} Past Days ({pastDays.length})</span>
              <ChevronRight size={14} style={{ transform: pastExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
              {pastExpanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="days-list" style={{ marginTop: 12 }}>
                    {pastDays.map(d => (
                      <DayCard key={d.key} dayName={d.dayName} dayDate={d.date} meals={d.meals} onMealChange={(meal, val) => handleMealChange(d.dayId, meal, val)} menuItems={menuItems} onOpenPicker={(meal, extra) => onOpenPicker({ weekKey, day: d.dayId, meal, ...extra })} onNavigateToBite={onNavigateToBite} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {mainDays.map(d => (
          <DayCard key={d.key} dayName={d.dayName} dayDate={d.date} meals={d.meals} onMealChange={(meal, val) => handleMealChange(d.dayId, meal, val)} menuItems={menuItems} onOpenPicker={(meal, extra) => onOpenPicker({ weekKey, day: d.dayId, meal, ...extra })} onNavigateToBite={onNavigateToBite} />
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ Shared Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ActionMenu({ onEdit, onDelete, onVisited, isVisited, onRemark, visitedLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="action-menu-container" ref={menuRef} style={{ zIndex: isOpen ? 9999 : 100, position: 'relative', width: '100%', height: '100%' }}>
      <button className="action-menu-trigger" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MoreVertical size={20} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="action-menu-dropdown" onClick={e => e.stopPropagation()}>
            {onVisited && (
              <button className="action-menu-item" onClick={() => { onVisited(); setIsOpen(false); }}>
                <Check size={14} /> <span>{visitedLabel || (isVisited ? 'Planned' : 'Visited')}</span>
              </button>
            )}
            {onRemark && (
              <button className="action-menu-item" onClick={() => { onRemark(); setIsOpen(false); }}>
                <MessageSquare size={14} /> <span>Remarks</span>
              </button>
            )}
            {onEdit && (
              <button className="action-menu-item" onClick={() => { onEdit(); setIsOpen(false); }}>
                <Edit3 size={14} /> <span>Edit</span>
              </button>
            )}
            <button className="action-menu-item delete" onClick={() => { onDelete(); setIsOpen(false); }}>
              <Trash2 size={14} /> <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-confirm-sm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </Modal>
  );
}

function MenuItemCard({ item, onEdit, onDelete, dragControls }) {
  return (
    <div className="menu-item">
      {dragControls && (
        <div className="drag-handle-inline" onPointerDown={(e) => dragControls.start(e)}>
          <GripVertical size={16} />
        </div>
      )}
      <div className="menu-item-content">
        <span className="menu-item-name">{item.name}</span>
        <div className="menu-item-action-wrapper">
          <ActionMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

function DraggableMenuItemWrapper({ item, onEdit, onDelete }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} id={item.id} dragListener={false} dragControls={controls} style={{ listStyle: 'none' }}>
      <MenuItemCard
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        dragControls={controls}
      />
    </Reorder.Item>
  );
}

// â”€â”€â”€ Menu Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AddMenuItemForm({ onSubmit, existingCategories, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [newCategory, setNewCategory] = useState('');

  const finalCategory = category === 'new' ? newCategory : category;

  // Combine default and existing categories for the dropdown
  const allCats = [...new Set([...DEFAULT_MENU_CATEGORIES, ...(existingCategories || [])])];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !finalCategory) return;
    onSubmit({ name: titleCase(name.trim()), category: titleCase(finalCategory.trim()) });
    if (!initialData) { setName(''); setCategory(''); setNewCategory(''); }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label="Dish Name">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Grilled Chicken" maxLength={40} required />
      </FormField>
      <FormField label="Category">
        <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category...</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="new">+ Add New Category</option>
        </select>
      </FormField>
      {category === 'new' && (
        <FormField label="New Category Name">
          <input className="form-input" value={newCategory} onChange={e => setNewCategory(e.target.value)}
            placeholder="e.g. Breakfast, Snacks" required />
        </FormField>
      )}
      <button type="submit" className="btn-primary" disabled={!name.trim() || !finalCategory}>
        {initialData ? 'Update Item' : 'Add to Menu'}
      </button>
    </form>
  );
}

function MenuTab({ menuItems, setMenuItems }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(menuItems.map(m => m.category))];
  const existingCategories = menuItems.map(m => m.category);

  const filtered = menuItems.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group by category for display
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAdd = (item) => {
    setMenuItems(prev => [{ ...item, id: Date.now() }, ...prev]);
    setShowForm(false);
  };

  const handleDelete = (id) => setMenuItems(prev => prev.filter(m => m.id !== id));

  const handleReorder = (newSortedSubset) => {
    setMenuItems(prev => {
      const newItems = [...prev];
      const subsetIds = newSortedSubset.map(n => n.id);
      const originalIndices = prev
        .map((m, idx) => subsetIds.includes(m.id) ? idx : -1)
        .filter(idx => idx !== -1);
      originalIndices.sort((a, b) => a - b);
      newSortedSubset.forEach((item, i) => {
        newItems[originalIndices[i]] = item;
      });
      return newItems;
    });
  };

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Menu</h2>
          <p className="tab-page-sub">{menuItems.length} dishes saved</p>
        </div>
        <button className="fab-sm" onClick={() => setShowForm(true)}><Plus size={18} /></button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search dishes..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Category Filter */}
      <div className="category-pills">
        {categories.map(cat => (
          <button key={cat} className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
            style={activeCategory === cat && cat !== 'All' ? { '--pill-color': catColor(cat) } : {}}
            onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {menuItems.length === 0 ? (
        <div className="empty-state">
          <UtensilsCrossed size={36} className="empty-icon" />
          <p>No dishes yet</p>
          <span>Tap + to add your first menu item</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No results found</p></div>
      ) : (
        <div className="menu-grouped">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="menu-group">
              <div className="menu-group-label">
                <div className="menu-group-dot" style={{ background: catColor(cat) }} />
                <span>{cat}</span>
                <span className="menu-group-count">{items.length}</span>
              </div>
              <div className="menu-items-list">
                <AnimatePresence>
                  {(activeCategory === 'All' && !search) ? (
                    <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="menu-reorder-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(item => (
                        <DraggableMenuItemWrapper key={item.id} item={item}
                          onEdit={() => setEditingItem(item)}
                          onDelete={() => setDeletingId(item.id)}
                        />
                      ))}
                    </Reorder.Group>
                  ) : (
                    items.map(item => (
                      <MenuItemCard key={item.id} item={item}
                        onEdit={() => setEditingItem(item)}
                        onDelete={() => setDeletingId(item.id)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Menu Item">
        <AddMenuItemForm onSubmit={handleAdd} existingCategories={existingCategories} />
      </Modal>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Edit Menu Item">
        <AddMenuItemForm initialData={editingItem} existingCategories={existingCategories}
          onSubmit={(data) => {
            setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...data } : m));
            setEditingItem(null);
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          setMenuItems(prev => prev.filter(m => m.id !== deletingId));
          setDeletingId(null);
        }}
        title="Delete Item?"
        message="Are you sure you want to remove this dish from your menu?"
      />
    </div>
  );
}

// â”€â”€â”€ Recipes Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AddRecipeForm({ onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [note, setNote] = useState(initialData?.note || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: titleCase(name.trim()), url: url.trim(), note: note.trim() });
    if (!initialData) { setName(''); setUrl(''); setNote(''); }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label="Dish Name">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Butter Chicken" maxLength={60} required />
      </FormField>
      <FormField label="Recipe Link (optional)">
        <input className="form-input" value={url} onChange={e => setUrl(e.target.value)}
          placeholder="https://..." type="url" />
      </FormField>
      <FormField label="Notes (optional)">
        <textarea className="form-input form-textarea" value={note} onChange={e => setNote(e.target.value)}
          placeholder="Any tips or variations..." rows={3} />
      </FormField>
      <button type="submit" className="btn-primary" disabled={!name.trim()}>Save Recipe</button>
    </form>
  );
}

function RecipeCard({ recipe, onEdit, onDelete, onToggleFavorite, dragControls }) {
  const favicon = recipe.url ? getFaviconUrl(recipe.url) : null;
  const domain = recipe.url ? (() => { try { return new URL(recipe.url.startsWith('http') ? recipe.url : 'https://' + recipe.url).hostname.replace('www.', ''); } catch { return null; } })() : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="recipe-card">
      {dragControls && (
        <div className="drag-handle-inline" onPointerDown={(e) => dragControls.start(e)}>
          <GripVertical size={16} />
        </div>
      )}
      <div className="card-main-content">
        <div className="recipe-card-top">
          {favicon ? (
            <img src={favicon} alt="" className="recipe-favicon" onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="recipe-favicon-placeholder"><BookOpen size={16} /></div>
          )}
          <div className="recipe-info">
            <h4 className="recipe-name">{recipe.name}</h4>
            {domain && <span className="recipe-domain">{domain}</span>}
          </div>
          <div className="recipe-actions">
            <button className={`bite-action-btn recipe-favorite-btn ${recipe.favourite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(recipe.id)} title="Favorite">
              <Star size={16} fill={recipe.favourite ? "currentColor" : "none"} />
            </button>
            {recipe.url && (
              <a href={recipe.url.startsWith('http') ? recipe.url : 'https://' + recipe.url}
                target="_blank" rel="noopener noreferrer" className="bite-action-btn recipe-link-btn" title="Recipe Link">
                <ExternalLink size={16} />
              </a>
            )}
            <div className="bite-action-btn-menu">
              <ActionMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        </div>
        {recipe.note && <p className="recipe-note">{recipe.note}</p>}
      </div>
    </motion.div>
  );
}

function DraggableRecipeWrapper({ recipe, onEdit, onDelete, onToggleFavorite }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={recipe} id={recipe.id} dragListener={false} dragControls={controls} style={{ listStyle: 'none' }}>
      <RecipeCard
        recipe={recipe}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        dragControls={controls}
      />
    </Reorder.Item>
  );
}

function RecipesTab({ recipes, setRecipes }) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const displayRecipes = showFavoritesOnly ? filtered.filter(r => r.favourite) : filtered;

  const handleAdd = (recipe) => {
    setRecipes(prev => [{ ...recipe, id: Date.now(), favourite: false }, ...prev]);
    setShowForm(false);
  };

  const handleToggleFavorite = (id) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, favourite: !r.favourite } : r));
  };

  const handleReorder = (newDisplayRecipes) => {
    if (search) return;
    setRecipes(prev => {
      const otherRecipes = prev.filter(r => !newDisplayRecipes.some(n => n.id === r.id));
      return [...newDisplayRecipes, ...otherRecipes];
    });
  };

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Recipes</h2>
          <p className="tab-page-sub">{recipes.length} saved</p>
        </div>
        <div className="tab-header-actions">
          <button className={`header-fav-toggle ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} title="Toggle Favourites">
            <Star size={18} fill={showFavoritesOnly ? "currentColor" : "none"} />
          </button>
          <button className="fab-sm" style={{ background: 'var(--primary)' }} onClick={() => setShowForm(true)}><Plus size={18} /></button>
        </div>
      </div>

      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search recipes..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} className="empty-icon" />
          <p>No recipes saved</p>
          <span>Tap + to save your first recipe link</span>
        </div>
      ) : displayRecipes.length === 0 ? (
        <div className="empty-state"><p>No {showFavoritesOnly ? 'favorite ' : ''}results found</p></div>
      ) : (
        <div className="recipes-list">
          <AnimatePresence>
            {!search ? (
              <Reorder.Group axis="y" values={displayRecipes} onReorder={handleReorder} className="recipes-reorder-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayRecipes.map(r => (
                  <DraggableRecipeWrapper key={r.id} recipe={r}
                    onEdit={() => setEditingRecipe(r)}
                    onDelete={() => setDeletingId(r.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </Reorder.Group>
            ) : (
              displayRecipes.map(r => (
                <RecipeCard key={r.id} recipe={r}
                  onEdit={() => setEditingRecipe(r)}
                  onDelete={() => setDeletingId(r.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Save Recipe">
        <AddRecipeForm onSubmit={handleAdd} />
      </Modal>

      <Modal isOpen={!!editingRecipe} onClose={() => setEditingRecipe(null)} title="Edit Recipe">
        <AddRecipeForm
          initialData={editingRecipe}
          onSubmit={(data) => {
            setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? { ...r, ...data } : r));
            setEditingRecipe(null);
          }}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          setRecipes(prev => prev.filter(r => r.id !== deletingId));
          setDeletingId(null);
        }}
        title="Delete Recipe?"
        message="Are you sure you want to remove this recipe?"
      />
    </div>
  );
}

// â”€â”€â”€ Shopping Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ShoppingTab({ shoppingList, setShoppingList }) {
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    setShoppingList(prev => [...prev, { id: Date.now(), text: titleCase(t), done: false }]);
    setNewItem('');
    inputRef.current?.focus();
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditText(item.text);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const saveEdit = (id) => {
    const t = editText.trim();
    if (!t) { setEditingId(null); return; }
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, text: titleCase(t) } : i));
    setEditingId(null);
  };

  const toggle = (id) => setShoppingList(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const del = (id) => setShoppingList(prev => prev.filter(i => i.id !== id));
  const clearDone = () => setShoppingList(prev => prev.filter(i => !i.done));

  const pending = shoppingList.filter(i => !i.done).length;
  const done = shoppingList.filter(i => i.done).length;

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Shopping</h2>
          <p className="tab-page-sub">{pending > 0 ? `${pending} item${pending > 1 ? 's' : ''} remaining` : done > 0 ? 'All done! ðŸŽ‰' : 'List is empty'}</p>
        </div>
        <div className="tab-header-actions">
          {shoppingList.some(i => i.done) && (
            <button className="btn-ghost-sm" style={{ color: '#ef4444' }} onClick={() => setShowClearConfirm(true)}>
              <Trash size={13} /> Clear Completed
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          setShoppingList(prev => prev.filter(i => !i.done));
          setShowClearConfirm(false);
        }}
        title="Clear Completed Items?"
        message="Are you sure you want to remove all checked items from your shopping list?"
      />

      <div className="shopping-add-row">
        <input ref={inputRef} className="shopping-input" value={newItem}
          onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem(); }}
          placeholder="Add an item..." maxLength={80} />
        <button className="shopping-add-btn" onClick={addItem} disabled={!newItem.trim()}><Plus size={18} /></button>
      </div>

      {shoppingList.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={36} className="empty-icon" />
          <p>Your list is empty</p>
          <span>Add items above to get started</span>
        </div>
      ) : (
        <div className="shopping-list">
          <AnimatePresence>
            {shoppingList.map(item => (
              <motion.div key={item.id} layout
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`shopping-item ${item.done ? 'done' : ''} ${editingId === item.id ? 'editing' : ''}`}>
                <button className={`check-circle ${item.done ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                  {item.done && <Check size={11} />}
                </button>
                {editingId === item.id ? (
                  <input ref={editInputRef} className="shopping-edit-input" value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveEdit(item.id)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(item.id); if (e.key === 'Escape') setEditingId(null); }}
                    maxLength={80} />
                ) : (
                  <>
                    <span className="item-text" onClick={() => startEditing(item)}>{item.text}</span>
                    <div className="item-actions">
                      <button className="edit-item-btn" onClick={() => startEditing(item)} title="Edit"><Edit3 size={13} /></button>
                      <button className="delete-item-btn" onClick={() => del(item.id)} title="Delete"><X size={13} /></button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ PlanFit Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FitSlot({ value, onAdd, onDelete }) {
  const colors = FIT_COLORS;
  const sessions = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div className="meal-slot fit-single-slot" style={{ '--slot-bg': colors.bg, '--slot-border': colors.border, '--slot-text': colors.text }}>
      <div className="meal-slot-label">
        <Dumbbell size={11} style={{ color: colors.text }} />
        <span>Today's Plan</span>
      </div>
      <div className={`meal-slot-display ${sessions.length > 0 ? 'filled' : 'empty'}`} onClick={onAdd} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {sessions.length > 0 ? (
          <div className="meal-chips" style={{ flex: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            {sessions.map((s, i) => (
              <span key={i} className="meal-chip">
                {s}
                <X size={10} className="chip-del" onClick={(e) => { e.stopPropagation(); onDelete(i); }} />
              </span>
            ))}
            <div className="fit-add-btn-wrap" style={{ marginLeft: 'auto' }}>
              <Plus size={22} className="fit-plus-btn-styled" />
            </div>
          </div>
        ) : (
          <div className="add-meal-field-placeholder" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 4 }}>
            <span>Add Workout</span>
            <Plus size={22} className="fit-plus-btn-styled" />
          </div>
        )}
      </div>
    </div>
  );
}

function WorkoutPicker({ isOpen, onClose, onSelect }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Workout">
      <div className="workout-picker-grid">
        {WORKOUT_OPTIONS.map(opt => (
          <button key={opt} className="workout-opt-btn" onClick={() => { onSelect(opt); onClose(); }}>
            <span>{opt}</span>
            <ChevronRight size={14} opacity={0.3} />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function FitCard({ dayName, dayDate, sessions, onSessionsChange, onOpenPicker }) {
  const todayFlag = dayDate && isToday(dayDate);
  
  // Robust conversion from old structures to array
  let sessionsList = [];
  if (Array.isArray(sessions)) {
    sessionsList = sessions;
  } else if (sessions && typeof sessions === 'object') {
    sessionsList = Object.values(sessions).filter(v => typeof v === 'string' && v.trim() !== '');
  } else if (typeof sessions === 'string' && sessions.trim() !== '') {
    sessionsList = [sessions];
  }
  
  const handleDelete = (idx) => {
    const newList = sessionsList.filter((_, i) => i !== idx);
    onSessionsChange(newList);
  };

  return (
    <motion.div layout className={`day-card fit-card ${todayFlag ? 'today' : ''}`}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="day-header">
        <div className="day-header-left">
          <span className="day-name">{dayName}</span>
          {dayDate && <span className="day-date">{dayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
          {todayFlag && <span className="today-badge" style={{ background: '#3b82f6' }}>Today</span>}
        </div>
        <div className="day-progress">
          {sessionsList.length > 0 ? (
            <div className="progress-dot" style={{ background: FIT_COLORS.text }} />
          ) : (
            <div className="progress-dot" style={{ background: 'rgba(255,255,255,0.08)' }} />
          )}
        </div>
      </div>
      <div className="meal-slots">
        <FitSlot 
          value={sessionsList} 
          onAdd={() => onOpenPicker(sessionsList.length)} 
          onDelete={handleDelete} 
        />
      </div>
    </motion.div>
  );
}

function FitDashboard({ plan }) {
  const [viewDate, setViewDate] = useState(new Date());
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // Helper to get actual dates from the app's YYYY-MM-DD week key
  const getDatesForWeek = (weekKey) => {
    // weekKey is the Monday of that week: "YYYY-MM-DD"
    const [y, m, d] = weekKey.split('-').map(Number);
    const monday = new Date(y, m - 1, d);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  };

  // Aggregate all sessions for the selected month
  const stats = Object.entries(plan).reduce((acc, [weekKey, weekData]) => {
    const weekDates = getDatesForWeek(weekKey);
    
    DAYS.forEach((day, i) => {
      const date = weekDates[i];
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        const rawSessions = weekData[day] || [];
        
        // Robust conversion to array (same as FitCard)
        let sessions = [];
        if (Array.isArray(rawSessions)) {
          sessions = rawSessions;
        } else if (rawSessions && typeof rawSessions === 'object') {
          sessions = Object.values(rawSessions).filter(v => typeof v === 'string' && v.trim() !== '');
        } else if (typeof rawSessions === 'string' && rawSessions.trim() !== '') {
          sessions = [rawSessions];
        }

        if (sessions.length === 0) return;

        const hasWorkout = sessions.some(s => s && s !== 'Rest Day');
        const hasRest = sessions.some(s => s === 'Rest Day');

        if (hasWorkout) acc.workoutDays++;
        if (hasRest) acc.restDays++;

        sessions.forEach(s => {
          if (s && s !== 'Rest Day') {
            acc.counts[s] = (acc.counts[s] || 0) + 1;
            acc.totalWorkouts++;
          }
        });
      }
    });

    return acc;
  }, { workoutDays: 0, restDays: 0, totalWorkouts: 0, counts: {} });

  const workoutOptions = WORKOUT_OPTIONS.filter(o => o !== 'Rest Day');
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="fit-dashboard tab-page" style={{ padding: '10px 16px' }}>
      <div className="month-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25, background: 'rgba(255,255,255,0.03)', padding: '12px 20px', borderRadius: 20, border: '1px solid var(--border)' }}>
        <button className="week-nav-btn" onClick={() => setViewDate(new Date(viewDate.setMonth(currentMonth - 1)))} style={{ opacity: 0.6 }}><ChevronLeft size={20} /></button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{monthName}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>{currentYear}</div>
        </div>
        <button className="week-nav-btn" onClick={() => setViewDate(new Date(viewDate.setMonth(currentMonth + 1)))} style={{ opacity: 0.6 }}><ChevronRight size={20} /></button>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 25 }}>
        <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.08)', padding: 22, borderRadius: 28, border: '1px solid rgba(59, 130, 246, 0.15)', textAlign: 'center' }}>
          <div style={{ color: '#3b82f6', fontSize: 36, fontWeight: 950 }}>{stats.workoutDays}</div>
          <div style={{ color: '#3b82f6', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 }}>Active Days</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 22, borderRadius: 28, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 950 }}>{stats.restDays}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 }}>Rest Days</div>
        </div>
      </div>

      <div className="dashboard-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px 15px', borderRadius: 28, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 5px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 850, color: '#fff' }}>Workout Volume</h3>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd700' }}>{stats.totalWorkouts} Total</span>
        </div>
        
        <div className="workout-stats-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {workoutOptions.filter(opt => (stats.counts[opt] || 0) > 0).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.5, fontSize: 13 }}>No sessions recorded for this month</div>
          ) : (
            workoutOptions.filter(opt => (stats.counts[opt] || 0) > 0).map(opt => {
              const count = stats.counts[opt] || 0;
              const maxCount = Math.max(...Object.values(stats.counts), 1);
              return (
                <div key={opt} className="workout-stat-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-dim)', fontSize: 13 }}>{opt}</span>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: 13 }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(count / maxCount) * 100}%` }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 10 }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function PlanFitTab({ plan, onPlanChange, subTab }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerSlot, setPickerSlot] = useState(null); // { day, index }
  const weekKey = getWeekKey(weekOffset);
  const weekDates = getWeekDates(weekOffset);
  const weekData = plan[weekKey] || {};

  if (subTab === 'dashboard') {
    return <FitDashboard plan={plan} />;
  }

  const workoutDays = DAYS.reduce((acc, d) => {
    const rawList = weekData[d] || [];
    let list = [];
    if (Array.isArray(rawList)) list = rawList;
    else if (rawList && typeof rawList === 'object') list = Object.values(rawList).filter(v => typeof v === 'string' && v.trim() !== '');
    else if (typeof rawList === 'string' && rawList.trim() !== '') list = [rawList];

    const hasWorkout = list.some(s => s && s !== 'Rest Day');
    return acc + (hasWorkout ? 1 : 0);
  }, 0);

  const restDays = DAYS.reduce((acc, d) => {
    const rawList = weekData[d] || [];
    let list = [];
    if (Array.isArray(rawList)) list = rawList;
    else if (rawList && typeof rawList === 'object') list = Object.values(rawList).filter(v => typeof v === 'string' && v.trim() !== '');
    else if (typeof rawList === 'string' && rawList.trim() !== '') list = [rawList];

    const hasRest = list.some(s => s === 'Rest Day');
    return acc + (hasRest ? 1 : 0);
  }, 0);

  const totalPlannedDays = DAYS.filter(d => Array.isArray(weekData[d]) && weekData[d].length > 0).length;

  return (
    <div className="planner-tab fit-tab">
      <div className="week-nav">
        <button className="week-nav-btn" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft size={18} /></button>
        <div className="week-nav-center">
          <span className="week-range">{formatWeekRange(weekOffset)}</span>
          {weekOffset !== 0 && <button className="go-today-btn" onClick={() => setWeekOffset(0)} style={{ color: '#3b82f6' }}>This Week</button>}
        </div>
        <button className="week-nav-btn" onClick={() => setWeekOffset(o => o + 1)}><ChevronRight size={18} /></button>
      </div>

      <div className="week-progress-bar" style={{ 
        background: `linear-gradient(90deg, #3b82f6 0%, #3b82f6 ${(workoutDays/7)*100}%, rgba(20,20,20,0.8) ${(workoutDays/7)*100}%, rgba(20,20,20,0.8) ${((workoutDays+restDays)/7)*100}%, rgba(255,255,255,0.05) 0%)`,
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span className="week-progress-label" style={{ zIndex: 3, color: '#ffd700', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          Workout : {workoutDays} {workoutDays === 1 ? 'Day' : 'Days'} & Rest : {restDays} {restDays === 1 ? 'Day' : 'Days'}
        </span>
      </div>

      <div className="days-list">
        {DAYS.map((day, i) => (
          <FitCard 
            key={day} 
            dayName={DAY_SHORT[i]} 
            dayDate={weekDates[i]} 
            sessions={weekData[day]} 
            onSessionsChange={(newList) => onPlanChange({ ...plan, [weekKey]: { ...weekData, [day]: newList } })} 
            onOpenPicker={(idx) => setPickerSlot({ day, index: idx })}
          />
        ))}
      </div>

      <WorkoutPicker 
        isOpen={!!pickerSlot} 
        onClose={() => setPickerSlot(null)} 
        onSelect={(val) => {
          const { day, index } = pickerSlot;
          const currentList = Array.isArray(weekData[day]) ? weekData[day] : (weekData[day] ? [weekData[day]] : []);
          const newList = [...currentList];
          if (index >= newList.length) {
            newList.push(val);
          } else {
            newList[index] = val;
          }
          onPlanChange({ ...plan, [weekKey]: { ...weekData, [day]: newList } });
        }} 
      />
    </div>
  );
}

// â”€â”€â”€ Root App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€â”€ Next Bites Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AddNextBiteForm({ onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [locationUrl, setLocationUrl] = useState(initialData?.locationUrl || '');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [dishes, setDishes] = useState(initialData?.dishes ? initialData.dishes.split(', ') : ['']);

  const handleDishChange = (idx, val) => {
    const updated = [...dishes];
    updated[idx] = val;
    setDishes(updated);
  };
  const addDishField = () => setDishes([...dishes, '']);
  const removeDishField = (idx) => {
    const updated = dishes.filter((_, i) => i !== idx);
    setDishes(updated.length > 0 ? updated : ['']);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cleanedDishes = dishes.map(d => titleCase(d.trim())).filter(Boolean);
    onSubmit({
      name: titleCase(name.trim()),
      location: titleCase(location.trim()),
      locationUrl: locationUrl.trim(),
      videoUrl: videoUrl.trim(),
      dishes: cleanedDishes.join(', '),
      completed: initialData?.completed || false,
      favourite: initialData?.favourite || false,
    });
    if (!initialData) { setName(''); setLocation(''); setLocationUrl(''); setVideoUrl(''); setDishes(['']); }
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label="Restaurant Name">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. The Pizza Place" maxLength={60} required />
      </FormField>
      <FormField label="Location">
        <input className="form-input" value={location} onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Downtown Avenue" maxLength={100} />
      </FormField>
      <FormField label="Location Link (URL)">
        <input className="form-input" value={locationUrl} onChange={e => setLocationUrl(e.target.value)}
          placeholder="https://maps.google.com/..." type="url" />
      </FormField>
      <FormField label="Reel/Youtube Link (optional)">
        <input className="form-input" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/..." type="url" />
      </FormField>
      <FormField label="Dishes">
        <div className="multi-add-list">
          {dishes.map((dish, idx) => (
            <div key={idx} className="multi-add-row">
              <input className="form-input" value={dish} onChange={e => handleDishChange(idx, e.target.value)}
                placeholder="e.g. Pepperoni Pizza" />
              {dishes.length > 1 && (
                <button type="button" className="slot-action-btn delete" onClick={() => removeDishField(idx)}><Trash2 size={13} /></button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add-more" onClick={addDishField}><Plus size={14} /> Add more dishes</button>
        </div>
      </FormField>
      <button type="submit" className="btn-primary" disabled={!name.trim()}>Save Restaurant</button>
    </form>
  );
}

function NextBiteCard({ bite, onEdit, onDelete, onToggleComplete, onToggleFavorite, forceActive, dragControls }) {
  const dishList = bite.dishes ? bite.dishes.split(', ') : [];
  const isVisualComplete = bite.completed && !forceActive;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className={`next-bite-card ${isVisualComplete ? 'completed' : ''}`} id={`bite-${bite.id}`}>
      {dragControls && (
        <div className="drag-handle-inline" onPointerDown={(e) => dragControls.start(e)}>
          <GripVertical size={16} />
        </div>
      )}
      <div className="card-main-content">
        <div className="bite-card-header">
          <div className="bite-card-title-group">
            <h4 className="bite-card-name">{bite.name}</h4>
            {bite.location && (
              <div className="bite-card-location">
                <MapPin size={12} />
                <span className="location-text">{bite.location}</span>
                {bite.locationUrl && (
                  <a href={bite.locationUrl} target="_blank" rel="noopener noreferrer" className="location-link-icon">
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}
          </div>
          <div className="bite-card-actions">
            <button className={`bite-action-btn bite-complete-toggle ${isVisualComplete ? 'active' : ''}`}
              onClick={() => onToggleComplete(bite.id)} title={isVisualComplete ? "Mark as To Visit" : "Mark as Visited"}>
              <Check size={16} />
            </button>
            <button className={`bite-action-btn bite-favorite-btn ${bite.favourite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(bite.id)} title="Favorite">
              <Heart size={16} fill={bite.favourite ? "currentColor" : "none"} />
            </button>
            {bite.videoUrl && (
              <a href={bite.videoUrl.startsWith('http') ? bite.videoUrl : 'https://' + bite.videoUrl}
                target="_blank" rel="noopener noreferrer" className="bite-action-btn video-link-btn" title="Watch Video">
                <Video size={16} />
              </a>
            )}
            <div className="bite-action-btn-menu">
              <ActionMenu onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        </div>

        {dishList.length > 0 && (
          <div className="bite-dishes-list">
            <div className="bite-dishes-label">Must Try Dishes:</div>
            <div className="bite-dish-chips">
              {dishList.map((d, i) => <span key={i} className="bite-dish-chip">{d}</span>)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DraggableBiteWrapper({ bite, onEdit, onDelete, onToggleComplete, onToggleFavorite, forceActive }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={bite} id={bite.id} dragListener={false} dragControls={controls} style={{ listStyle: 'none' }}>
      <NextBiteCard
        bite={bite}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
        onToggleFavorite={onToggleFavorite}
        dragControls={controls}
        forceActive={forceActive}
      />
    </Reorder.Item>
  );
}

function NextBitesTab({ bites, setBites, initialSearch, setInitialSearch, highlightedBiteId, setHighlightedBiteId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBite, setEditingBite] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' or 'favorites'
  const [biteView, setBiteView] = useState('to-visit'); // 'to-visit' or 'visited'

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
      setInitialSearch(''); // Clear it back in parent once applied
    }
  }, [initialSearch, setInitialSearch]);

  useEffect(() => {
    if (highlightedBiteId) {
      setTimeout(() => {
        const el = document.getElementById(`bite-${highlightedBiteId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-pulse');
          setTimeout(() => el.classList.remove('highlight-pulse'), 3000);
        }
        setHighlightedBiteId(null);
      }, 100);
    }
  }, [highlightedBiteId, setHighlightedBiteId]);

  const handleAdd = (data) => {
    setBites(prev => [{ ...data, id: Date.now() }, ...prev]);
    setShowForm(false);
  };

  const handleToggle = (id) => {
    setBites(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  const handleToggleFavorite = (id) => {
    setBites(prev => prev.map(b => b.id === id ? { ...b, favourite: !b.favourite } : b));
  };

  const handleReorder = (newSortedBites) => {
    if (search) return;
    setBites(prev => {
      const otherBites = prev.filter(b => !newSortedBites.some(n => n.id === b.id));
      return [...newSortedBites, ...otherBites];
    });
  };

  const activeBites = bites.filter(b => !b.completed &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location?.toLowerCase().includes(search.toLowerCase()) ||
      b.dishes?.toLowerCase().includes(search.toLowerCase()))
  );

  const completedBites = bites.filter(b => b.completed &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location?.toLowerCase().includes(search.toLowerCase()) ||
      b.dishes?.toLowerCase().includes(search.toLowerCase()))
  );

  const favoritesBites = bites.filter(b => b.favourite &&
    (b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location?.toLowerCase().includes(search.toLowerCase()) ||
      b.dishes?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Next Bites</h2>
          <p className="tab-page-sub">{activeBites.length} places to explore</p>
        </div>
        <div className="tab-header-actions">
          <button className={`header-fav-toggle ${activeSubTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveSubTab(prev => prev === 'all' ? 'favorites' : 'all')} title="Toggle Favourites">
            <Heart size={20} fill={activeSubTab === 'favorites' ? "currentColor" : "none"} />
          </button>
          <button className="fab-sm" style={{ background: 'var(--primary)' }} onClick={() => setShowForm(true)}><Plus size={18} /></button>
        </div>
      </div>

      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by name, location or dishes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="next-bites-sub-nav">
        <button className={`sub-nav-btn ${activeSubTab === 'all' && biteView === 'to-visit' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('all'); setBiteView('to-visit'); }}>
          To Visit ({activeBites.length})
        </button>
        <button className={`sub-nav-btn ${activeSubTab === 'all' && biteView === 'visited' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('all'); setBiteView('visited'); }}>
          Visited ({completedBites.length})
        </button>
      </div>

      <div className="bites-list">
        {activeSubTab === 'all' ? (
          biteView === 'to-visit' ? (
            activeBites.length === 0 ? (
              <div className="empty-state">
                <Star size={36} className="empty-icon" />
                <p>Your wishlist is empty</p>
                <span>Tap + to add restaurants you want to visit</span>
              </div>
            ) : (
              <Reorder.Group axis="y" values={activeBites} onReorder={handleReorder} className="active-bites-section">
                {activeBites.map((b) => (
                  <DraggableBiteWrapper key={b.id} bite={b} onEdit={() => setEditingBite(b)}
                    onDelete={() => setDeletingId(b.id)} onToggleComplete={handleToggle} onToggleFavorite={handleToggleFavorite} />
                ))}
              </Reorder.Group>
            )
          ) : (
            completedBites.length === 0 ? (
              <div className="empty-state">
                <MapPin size={36} className="empty-icon" />
                <p>No visited places yet</p>
                <span>Check off restaurants once you've visited them</span>
              </div>
            ) : (
              <Reorder.Group axis="y" values={completedBites} onReorder={handleReorder} className="completed-bites-section">
                {completedBites.map(b => (
                  <DraggableBiteWrapper key={b.id} bite={b} onEdit={() => setEditingBite(b)}
                    onDelete={() => setDeletingId(b.id)} onToggleComplete={handleToggle} onToggleFavorite={handleToggleFavorite} />
                ))}
              </Reorder.Group>
            )
          )
        ) : (
          <div className="active-bites-section">
            {favoritesBites.length === 0 ? (
              <div className="empty-state">
                <Heart size={36} className="empty-icon" style={{ color: '#ff6b6b' }} />
                <p>No favourites yet</p>
                <span>Tap the heart icon on any restaurant to see it here</span>
              </div>
            ) : (
              <Reorder.Group axis="y" values={favoritesBites} onReorder={handleReorder} className="active-bites-section">
                {favoritesBites.map(b => (
                  <DraggableBiteWrapper key={`fav-${b.id}`} bite={b} onEdit={() => setEditingBite(b)}
                    onDelete={() => setDeletingId(b.id)} onToggleComplete={handleToggle} onToggleFavorite={handleToggleFavorite}
                    forceActive={true} />
                ))}
              </Reorder.Group>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Restuarant">
        <AddNextBiteForm onSubmit={handleAdd} />
      </Modal>

      <Modal isOpen={!!editingBite} onClose={() => setEditingBite(null)} title="Edit Restaurant">
        <AddNextBiteForm initialData={editingBite}
          onSubmit={(data) => {
            setBites(prev => prev.map(b => b.id === editingBite.id ? { ...b, ...data } : b));
            setEditingBite(null);
          }}
        />
      </Modal>

      <ConfirmModal isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => {
        setBites(prev => prev.filter(b => b.id !== deletingId));
        setDeletingId(null);
      }} title="Delete Restaurant?" message="Are you sure you want to remove this restaurant from your list?" />
    </div>
  );
}

const TABS = [
  { id: 'planner', label: 'Planner', Icon: CalendarDays },
  { id: 'menu', label: 'Menu', Icon: UtensilsCrossed },
  { id: 'recipes', label: 'Recipes', Icon: BookOpen },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCart },
  { id: 'nextbites', label: 'Next Bites', Icon: Star },
];

function MenuPicker({ isOpen, onClose, menuItems, nextBites, onSelect, initialMode }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [pickerMode, setPickerMode] = useState(initialMode || 'menu'); // 'menu' or 'eating-out'

  useEffect(() => {
    if (isOpen && initialMode) {
      setPickerMode(initialMode);
    }
  }, [isOpen, initialMode]);

  const categories = pickerMode === 'menu' ? ['All', ...new Set(menuItems.map(m => m.category))] : [];

  const filteredItems = pickerMode === 'menu'
    ? menuItems.filter(item => {
      const matchesCat = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    })
    : nextBites
        .filter(bite => bite.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  const grouped = pickerMode === 'menu'
    ? filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {})
    : null;

  const modalTitle = pickerMode === 'eating-out' ? 'Select Restaurant' : 'Select Meals';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {!initialMode && (
        <div className="picker-header">
          <div className="picker-mode-toggle">
            <button className={`picker-mode-btn ${pickerMode === 'menu' ? 'active' : ''}`}
              onClick={() => { setPickerMode('menu'); setSearch(''); }}>
              Home Menu
            </button>
            <button className={`picker-mode-btn ${pickerMode === 'eating-out' ? 'active' : ''}`}
              onClick={() => { setPickerMode('eating-out'); setSearch(''); }}>
              Eating Out
            </button>
          </div>
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: 12 }}>
        <Search size={15} className="search-icon" />
        <input className="search-input"
          placeholder={pickerMode === 'menu' ? "Search saved dishes..." : "Search restaurants..."}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {pickerMode === 'menu' && (
        <div className="category-pills" style={{ marginBottom: 16 }}>
          {categories.map(cat => (
            <button key={cat} className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
              style={activeCategory === cat && cat !== 'All' ? { '--pill-color': catColor(cat) } : {}}
              onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {pickerMode === 'menu' ? (
        menuItems.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed size={36} className="empty-icon" />
            <p>Menu is empty</p>
            <span>Add some dishes in the Menu tab first</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state"><p>No results found</p></div>
        ) : (
          <div className="menu-picker-list">
            <div className="menu-grouped" style={{ marginBottom: 80 }}>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="menu-group">
                  <div className="menu-group-label">
                    <div className="menu-group-dot" style={{ background: catColor(cat) }} />
                    <span>{cat}</span>
                  </div>
                  <div className="menu-items-list">
                    {items.map(item => (
                      <button key={item.id} className="menu-item" onClick={() => onSelect(item.name)} style={{ textAlign: 'left', width: '100%' }}>
                        <span className="menu-item-name">{item.name}</span>
                        <Plus size={14} style={{ opacity: 0.4 }} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        nextBites.length === 0 ? (
          <div className="empty-state">
            <Star size={36} className="empty-icon" />
            <p>No restaurants found</p>
            <span>Add some restaurants in the Next Bites tab first</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state"><p>No restaurants found</p></div>
        ) : (
          <div className="menu-picker-list">
            <div className="restaurants-list-picker" style={{ marginBottom: 80, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredItems.map(bite => (
                <button key={bite.id} className="menu-item" onClick={() => { onSelect(`${EATING_OUT_PREFIX}${bite.name}`); onClose(); }} style={{ textAlign: 'left', width: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="menu-item-name">{bite.name}</span>
                      {bite.completed && (
                        <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Visited</span>
                      )}
                    </div>
                    {bite.location && <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 2 }}>{bite.location}</div>}
                  </div>
                  <Plus size={14} style={{ opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        )
      )}

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(transparent, var(--bg-card))', pointerEvents: 'none' }}>
        <button className="primary-btn" onClick={onClose} style={{ pointerEvents: 'auto', width: '100%', borderRadius: 16 }}>
          Done <Check size={18} style={{ marginLeft: 6 }} />
        </button>
      </div>
    </Modal>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(() => localStorage.getItem('activeTab') || 'planner');
  const [nextBitesSearch, setNextBitesSearch] = useState('');
  const [highlightedBiteId, setHighlightedBiteId] = useState(null);
  const [plan, setPlan] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [nextBites, setNextBites] = useState([]);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [activeSection, setActiveSection] = useState(() => localStorage.getItem('activeSection') || 'PlanBite');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [planWatchTab, setPlanWatchTab] = useState(() => localStorage.getItem('planWatchTab') || 'movies');
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [travelDestinations, setTravelDestinations] = useState([]);
  const [planGoTab, setPlanGoTab] = useState(() => localStorage.getItem('planGoTab') || 'domestic');
  const [planFit, setPlanFit] = useState({});
  const [planFitTab, setPlanFitTab] = useState('planner');
  const [selectedTravelId, setSelectedTravelId] = useState(() => {
    const val = localStorage.getItem('selectedTravelId');
    return val && val !== 'null' ? (isNaN(val) ? val : Number(val)) : null;
  });
  const [selectedWatchId, setSelectedWatchId] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const isExitingRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (isExitingRef.current) return;
      setShowExitConfirm(true);
      window.history.pushState(null, '', window.location.pathname);
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pb-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Persistence Effects
  useEffect(() => { localStorage.setItem('activeSection', activeSection); }, [activeSection]);
  useEffect(() => { localStorage.setItem('activeTab', tab); }, [tab]);
  useEffect(() => { localStorage.setItem('planWatchTab', planWatchTab); }, [planWatchTab]);
  useEffect(() => { localStorage.setItem('planGoTab', planGoTab); }, [planGoTab]);
  useEffect(() => { localStorage.setItem('selectedTravelId', selectedTravelId); }, [selectedTravelId]);

  // 1. Auth Listener
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  useEffect(() => {
    console.log("Firebase Auth: Initializing...");
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthChecked(true);
      if (!u) {
        console.warn("Firebase Auth: No user signed in");
        setLoading(false);
      } else {
        console.log("Firebase Auth: Signed in as", u.uid);
      }
    });
  }, []);

  // 2. Initial Data Load & Migration (Refactored for solid multi-device sync)
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);

    let unsub = null;

    const initializeData = async () => {
      try {
        const snap = await getDoc(userDocRef);
        let currentData = snap.exists() ? snap.data() : null;

        // If account is new OR explicitly empty, try to migrate from shared data
        const isEmpty = !currentData || (
          Object.keys(currentData.plan || {}).length === 0 &&
          (currentData.menu || []).length === 0 &&
          (currentData.recipes || []).length === 0 &&
          (currentData.nextbites || []).length === 0
        );

        if (isEmpty) {
          console.log("Firestore: Account is empty. Checking for shared data...");
          let sharedSnap = null;
          try {
            const sharedDocRef = doc(db, 'users', 'shared-kitchen-v1');
            sharedSnap = await getDoc(sharedDocRef);
          } catch (fetchErr) {
            console.warn("Firestore: Shared data access denied or failed. Proceeding to local backup.", fetchErr.code);
          }

          if (sharedSnap && sharedSnap.exists()) {
            console.log("Firestore: Found shared data! Migrating to account...");
            const sharedData = sharedSnap.data();
            await setDoc(userDocRef, sharedData);
            // After setting doc, the listener will take over
          } else {
            console.log("Firestore: Using local backup or empty state...");
            const localData = {
              plan: load('mp-plan', {}),
              menu: load('mp-menu', []),
              recipes: load('mp-recipes', []),
              shopping: load('mp-shopping', []),
              nextbites: load('mp-nextbites', []),
              movies: load('mp-movies', []),
              series: load('mp-series', []),
              travel: load('mp-travel', []),
            };
            await setDoc(userDocRef, localData);
          }
        }

        // Start live listener
        unsub = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Auto-cleanup old meal data (> 30 days)
            const currentPlan = data.plan || {};
            const allowedWeeks = [];
            // Keep 5 weeks in past, current week, and 52 weeks in future
            for (let i = -5; i <= 52; i++) {
              allowedWeeks.push(getWeekKey(i));
            }

            let hasChanges = false;
            const cleanedPlan = { ...currentPlan };
            Object.keys(cleanedPlan).forEach(key => {
              // Only cleanup week-keys (YYYY-WW), don't touch destinations or other global keys
              if (/^\d{4}-\d{1,2}$/.test(key) && !allowedWeeks.includes(key)) {
                delete cleanedPlan[key];
                hasChanges = true;
              }
            });

            if (hasChanges) {
              console.log("Cleanup: Removing old meal data keys...");
              setDoc(userDocRef, { ...data, plan: cleanedPlan });
            }

            setPlan(cleanedPlan);
            setMenuItems(data.menu || []);
            setRecipes(data.recipes || []);
            setShoppingList(data.shopping || []);
            setNextBites(data.nextbites || []);
            setMovies(data.movies || []);
            setSeries(data.series || []);
            setTravelDestinations(data.travel || []);
            setPlanFit(data.planfit || {});
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore: Sync Error:", err.message);
          setLoading(false);
        });
      } catch (err) {
        console.error("Firestore: Init Error:", err.message);
        console.warn("Falling back to local storage due to Firestore permissions...");
        setPlan(load('mp-plan', {}));
        setMenuItems(load('mp-menu', []));
        setRecipes(load('mp-recipes', []));
        setShoppingList(load('mp-shopping', []));
        setNextBites(load('mp-nextbites', []));
        setMovies(load('mp-movies', []));
        setSeries(load('mp-series', []));
        setTravelDestinations(load('mp-travel', []));
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      if (unsub) {
        console.log("Firestore: Cleaning up sync listener");
        unsub();
      }
    };
  }, [user]);

  // Firestore update helpers
  const updateFirebase = async (field, value) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { [field]: value }, { merge: true });
    } catch (err) {
      console.error(`Firestore: Update failed for ${field}:`, err.message);
    }
  };

  const handlePlanChange = (val) => {
    const newVal = typeof val === 'function' ? val(plan) : val;
    setPlan(newVal);
    localStorage.setItem('mp-plan', JSON.stringify(newVal));
    updateFirebase('plan', newVal);
  };
  const handleMenuChange = (val) => {
    const newVal = typeof val === 'function' ? val(menuItems) : val;
    setMenuItems(newVal);
    localStorage.setItem('mp-menu', JSON.stringify(newVal));
    updateFirebase('menu', newVal);
  };
  const handleRecipesChange = (val) => {
    const newVal = typeof val === 'function' ? val(recipes) : val;
    setRecipes(newVal);
    localStorage.setItem('mp-recipes', JSON.stringify(newVal));
    updateFirebase('recipes', newVal);
  };
  const handleShoppingChange = (val) => {
    const newVal = typeof val === 'function' ? val(shoppingList) : val;
    setShoppingList(newVal);
    localStorage.setItem('mp-shopping', JSON.stringify(newVal));
    updateFirebase('shopping', newVal);
  };
  const handleNextBitesChange = (val) => {
    const newVal = typeof val === 'function' ? val(nextBites) : val;
    setNextBites(newVal);
    localStorage.setItem('mp-nextbites', JSON.stringify(newVal));
    updateFirebase('nextbites', newVal);
  };

  const handleMoviesChange = (val) => {
    const newVal = typeof val === 'function' ? val(movies) : val;
    setMovies(newVal);
    localStorage.setItem('mp-movies', JSON.stringify(newVal));
    updateFirebase('movies', newVal);
  };

  const handleSeriesChange = (val) => {
    const newVal = typeof val === 'function' ? val(series) : val;
    setSeries(newVal);
    localStorage.setItem('mp-series', JSON.stringify(newVal));
    updateFirebase('series', newVal);
  };

  const handleTravelChange = (val) => {
    const newVal = typeof val === 'function' ? val(travelDestinations) : val;
    setTravelDestinations(newVal);
    localStorage.setItem('mp-travel', JSON.stringify(newVal));
    updateFirebase('travel', newVal);
  };

  const handleNavigateToBite = (name) => {
    if (!name) return;
    const cleanName = name.toLowerCase().trim();
    console.log("App: Navigating to Next Bite card for:", cleanName);

    // Find the bite BEFORE switching tabs to ensure we have the ID
    const bite = nextBites.find(b =>
      b.name.toLowerCase().trim() === cleanName ||
      b.name.toLowerCase().includes(cleanName) ||
      cleanName.includes(b.name.toLowerCase())
    );

    setTab('nextbites');
    setNextBitesSearch(name);

    if (bite) {
      console.log("App: Found matching bite! Highlighting ID:", bite.id);
      setHighlightedBiteId(bite.id);
    } else {
      console.warn("App: Could not find bite matching:", cleanName, "in current wishlist:", nextBites);
    }

    // Scroll to top to ensure visibility
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePickerSelect = (name) => {
    if (!pickerSlot) return;
    const { weekKey, day, meal } = pickerSlot;
    const weekData = plan[weekKey] || emptyWeek();
    const currentVal = weekData[day]?.[meal] || '';
    const dishes = currentVal ? currentVal.split(',').map(d => d.trim()).filter(Boolean) : [];

    if (dishes.includes(name)) return; // Don't duplicate

    const newVal = [...dishes, name].join(', ');

    const newPlan = {
      ...plan,
      [weekKey]: {
        ...weekData,
        [day]: { ...weekData[day], [meal]: newVal }
      }
    };

    handlePlanChange(newPlan);
    setPickerSlot(null); // Auto-close after selection
  };

  return (
    <div className="app-shell">
      {(!isAuthChecked || (user && loading)) && <LoadingOverlay />}
      {!isAuthChecked ? null : !user ? <LoginScreen /> : (
        <>
          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="sidebar-overlay"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="sidebar-drawer"
                >
                  <div className="sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -10 }}>
                      <button className="sidebar-close" onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <X size={22} />
                      </button>
                    </div>
                    <div className="sidebar-user-profile">
                      <div className="sidebar-avatar">
                        <User size={24} />
                      </div>
                      <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="sidebar-user-status">
                          <div className="status-dot"></div>
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sidebar-content">
                    <button
                      className={`sidebar-nav-item ${activeSection === 'PlanBite' ? 'active' : ''}`}
                      onClick={() => { setActiveSection('PlanBite'); setSidebarOpen(false); }}
                    >
                      <ChefHat size={22} />
                      <span className="sidebar-nav-title">PlanBite</span>
                      {activeSection === 'PlanBite' && <div className="sidebar-active-indicator" />}
                    </button>

                    <button
                      className={`sidebar-nav-item ${activeSection === 'PlanWatch' ? 'active' : ''}`}
                      onClick={() => { setActiveSection('PlanWatch'); setSidebarOpen(false); }}
                    >
                      <MonitorPlay size={22} />
                      <span className="sidebar-nav-title">PlanWatch</span>
                      {activeSection === 'PlanWatch' && <div className="sidebar-active-indicator" />}
                    </button>

                    <button
                      className={`sidebar-nav-item ${activeSection === 'PlanGo' ? 'active' : ''}`}
                      onClick={() => { setActiveSection('PlanGo'); setSidebarOpen(false); }}
                    >
                      <Map size={22} />
                      <span className="sidebar-nav-title">PlanGo</span>
                      {activeSection === 'PlanGo' && <div className="sidebar-active-indicator" />}
                    </button>
                    
                    <button
                      className={`sidebar-nav-item ${activeSection === 'PlanFit' ? 'active' : ''}`}
                      onClick={() => { setActiveSection('PlanFit'); setSidebarOpen(false); }}
                    >
                      <Dumbbell size={22} />
                      <span className="sidebar-nav-title">PlanFit</span>
                      {activeSection === 'PlanFit' && <div className="sidebar-active-indicator" />}
                    </button>

                    <div className="sidebar-footer">
                      <button className="sidebar-logout-btn" onClick={() => { signOut(auth); setSidebarOpen(false); }}>
                        <LogOut size={22} />
                        <span className="sidebar-nav-title" style={{ color: '#ef4444' }}>Log Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <header className="app-header">
            <div className="header-brand">
              <button className="header-menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={22} />
              </button>
              <div className="header-logo-container" style={{ marginLeft: 8 }}>
                <img src={activeSection === 'PlanBite' ? '/plan-bit-icon.jpg' : '/plan-watch-icon.jpg'} alt="Logo" className="header-logo-img" />
              </div>
              <div>
                <h1 className="header-title">{activeSection}</h1>
                <div className="header-subtitle-row">
                  <p className="header-subtitle">{activeSection === 'PlanBite' ? 'Plan. Cook. Eat. ' : activeSection === 'PlanGo' ? 'Plan. Pack. Go.' : activeSection === 'PlanFit' ? 'Plan. Train. Gain.' : 'Plan. Watch. Enjoy.'}</p>
                  <div className="sync-badge">
                    <div className="sync-dot"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-refresh-btn" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button className="header-refresh-btn" onClick={() => window.location.reload()} title="Sync Now">
                <RotateCw size={18} />
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="app-main">
            <AnimatePresence mode="wait">
              {!loading && (
                <motion.div key={activeSection === 'PlanBite' ? tab : activeSection === 'PlanGo' ? 'plango' : planWatchTab}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="tab-content">
                  {activeSection === 'PlanBite' && (
                    <>
                      {tab === 'planner' && <PlannerTab plan={plan} onPlanChange={handlePlanChange} menuItems={menuItems} onOpenPicker={setPickerSlot} onNavigateToBite={handleNavigateToBite} />}
                      {tab === 'menu' && <MenuTab menuItems={menuItems} setMenuItems={handleMenuChange} />}
                      {tab === 'recipes' && <RecipesTab recipes={recipes} setRecipes={handleRecipesChange} />}
                      {tab === 'shopping' && <ShoppingTab shoppingList={shoppingList} setShoppingList={handleShoppingChange} />}
                      {tab === 'nextbites' && <NextBitesTab bites={nextBites} setBites={handleNextBitesChange} initialSearch={nextBitesSearch} setInitialSearch={setNextBitesSearch} highlightedBiteId={highlightedBiteId} setHighlightedBiteId={setHighlightedBiteId} />}
                    </>
                  )}
                  {activeSection === 'PlanWatch' && (
                    <PlanWatchTab
                      type={planWatchTab}
                      items={planWatchTab === 'movies' ? movies : series}
                      setItems={planWatchTab === 'movies' ? handleMoviesChange : handleSeriesChange}
                      selectedId={selectedWatchId}
                      setSelectedId={setSelectedWatchId}
                    />
                  )}
                  {activeSection === 'PlanGo' && (
                    <PlanGoTab
                      destinations={travelDestinations}
                      setDestinations={handleTravelChange}
                      filter={planGoTab}
                      selectedId={selectedTravelId}
                      setSelectedId={setSelectedTravelId}
                    />
                  )}
                  {activeSection === 'PlanFit' && (
                    <PlanFitTab 
                      plan={planFit} 
                      subTab={planFitTab}
                      onPlanChange={(val) => {
                        const newVal = typeof val === 'function' ? val(planFit) : val;
                        setPlanFit(newVal);
                        localStorage.setItem('mp-planfit', JSON.stringify(newVal));
                        updateFirebase('planfit', newVal);
                      }} 
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <MenuPicker
              isOpen={!!pickerSlot}
              onClose={() => setPickerSlot(null)}
              menuItems={menuItems}
              nextBites={nextBites}
              onSelect={handlePickerSelect}
              initialMode={pickerSlot?.initialMode}
            />
          </main>

          <ConfirmModal
            isOpen={showExitConfirm}
            onClose={() => setShowExitConfirm(false)}
            onConfirm={() => {
              isExitingRef.current = true;
              setShowExitConfirm(false);
              window.history.go(-2); 
            }}
            title="Exit PlanBite?"
            message="Are you sure you want to exit the app?"
          />

          {/* Bottom Nav */}
          {activeSection === 'PlanFit' && (
            <nav className="bottom-nav">
              <button className={`nav-btn ${planFitTab === 'planner' ? 'active' : ''}`} onClick={() => setPlanFitTab('planner')}>
                <div className="nav-icon-wrap"><Dumbbell size={20} /></div>
                <span>Fit Planner</span>
              </button>
              <button className={`nav-btn ${planFitTab === 'dashboard' ? 'active' : ''}`} onClick={() => setPlanFitTab('dashboard')}>
                <div className="nav-icon-wrap"><Activity size={20} /></div>
                <span>Dashboard</span>
              </button>
            </nav>
          )}
          {activeSection === 'PlanBite' ? (
            <nav className="bottom-nav">
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} id={`nav-${id}`}
                  className={`nav-btn ${tab === id ? 'active' : ''}`}
                  onClick={() => setTab(id)}>
                  <div className="nav-icon-wrap"><Icon size={20} /></div>
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          ) : activeSection === 'PlanWatch' ? (
            !selectedWatchId && (
              <nav className="bottom-nav">
                <button className={`nav-btn ${planWatchTab === 'movies' ? 'active' : ''}`} onClick={() => setPlanWatchTab('movies')}>
                  <div className="nav-icon-wrap"><Clapperboard size={20} /></div>
                  <span>Movies</span>
                </button>
                <button className={`nav-btn ${planWatchTab === 'series' ? 'active' : ''}`} onClick={() => setPlanWatchTab('series')}>
                  <div className="nav-icon-wrap"><Tv size={20} /></div>
                  <span>Series</span>
                </button>
              </nav>
            )
          ) : activeSection === 'PlanGo' ? (
            !selectedTravelId && (
              <nav className="bottom-nav">
                <button className={`nav-btn ${planGoTab === 'domestic' ? 'active' : ''}`} onClick={() => setPlanGoTab('domestic')}>
                  <div className="nav-icon-wrap"><Briefcase size={20} /></div>
                  <span>Domestic</span>
                </button>
                <button className={`nav-btn ${planGoTab === 'international' ? 'active' : ''}`} onClick={() => setPlanGoTab('international')}>
                  <div className="nav-icon-wrap"><Globe size={20} /></div>
                  <span>International</span>
                </button>
              </nav>
            )
          ) : null}
        </>
      )}
    </div>
  );
}

function WatchCardLarge({ item, type, onEdit, onDelete, onToggleFavorite, onToggleComplete, onClick, view }) {
  return (
    <div id={`watch-card-${item.id}`} className="watch-card-large" onClick={onClick}>
      {type === 'series' && view === 'watched' && Array.isArray(item.seasons) && item.seasons.length > 0 && item.seasons.some(s => (s.episodes || []).some(e => !e.watched)) && (
        <div className="not-finished-badge-container">
          <div className="not-finished-badge">Not Finished</div>
          <div className="not-finished-progress">
            {(() => {
              const rs = item.seasons.filter(s => (s.episodes || []).some(e => !e.watched)).length;
              const re = item.seasons.reduce((acc, s) => acc + (s.episodes || []).filter(e => !e.watched).length, 0);
              return `${rs} S - ${re} E Left`;
            })()}
          </div>
        </div>
      )}
      <div className="watch-card-inner">
        {item.posterUrl ? (
          <>
            <img src={item.posterUrl} alt="" className="watch-poster-blur" />
            <img src={item.posterUrl} alt="" className="watch-poster-bg" />
          </>
        ) : (
          <div className="watch-card-placeholder">
            {type === 'movies' ? <Film size={60} /> : <Tv size={60} />}
            <span style={{ marginTop: 15, fontWeight: 700, opacity: 0.5 }}>NO POSTER</span>
          </div>
        )}
        <div className="watch-overlay-large" />

        <div className="watch-content-large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div className="watch-title-large">{item.title}</div>
            <div style={{}}>
              <ActionMenu
                onEdit={onEdit}
                onDelete={onDelete}
                onVisited={type === 'series' && item.completed ? onToggleComplete : null}
                visitedLabel="Move to Watchlist"
              />
            </div>
          </div>

          <div className="watch-meta-large">
            {type === 'movies' ? (
              <span>{item.year || 'N/A'}</span>
            ) : (
              Array.isArray(item.seasons) && item.seasons.length > 0 && (
                <span style={{ color: '#fff' }}>
                  {item.seasons.length} Season{item.seasons.length !== 1 ? 's' : ''} • {item.seasons.reduce((acc, s) => acc + (s.episodes || []).length, 0)} Episodes
                </span>
              )
            )}
            {item.language && <span className="watch-tag" style={{ background: 'var(--primary-dim)', color: 'var(--primary)', border: 'none' }}>{item.language}</span>}
            {item.genres && item.genres.split(',').slice(0, 2).map((g, i) => (
              <span key={i} className="watch-tag" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>{g.trim()}</span>
            ))}
          </div>



          <div className="watch-synopsis-large">
            {item.synopsis || item.note || 'No description available for this title.'}
          </div>

          {item.remarks && (
            <div className="watch-remarks-large">
              <Sparkles size={10} style={{ marginRight: 6, color: 'var(--primary)' }} />
              <span>{item.remarks}</span>
            </div>
          )}

          <div className="watch-footer-large">
            <button
              className="watch-action-btn-large"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.google.com/search?q=${encodeURIComponent(item.title)}+${type === 'movies' ? 'movie' : 'series'}`, '_blank');
              }}
              title="Search on Google"
            >
              <Globe size={24} />
            </button>

            {(!item.completed || type === 'movies') && (
              <button
                className="watch-main-btn-large active"
                style={{ background: 'var(--primary)', color: '#000' }}
                onClick={type === 'movies' ? onDelete : onToggleComplete}
              >
                <Check size={20} />
                <span>Mark as Watched</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddWatchItemForm({ onSubmit, initialData, type }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [extra, setExtra] = useState(type === 'movies' ? (initialData?.year || '') : (initialData?.seasons || ''));
  const [note, setNote] = useState(initialData?.note || '');
  const [posterUrl, setPosterUrl] = useState(initialData?.posterUrl || '');
  const [synopsis, setSynopsis] = useState(initialData?.synopsis || '');
  const [rating, setRating] = useState(initialData?.rating || '');
  const [genres, setGenres] = useState(initialData?.genres || '');
  const [remarks, setRemarks] = useState(initialData?.remarks || '');
  const [language, setLanguage] = useState(initialData?.language || '');

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = async (query) => {
    if (!query) return;
    setIsSearching(true);
    try {
      const resp = await fetch(`https://imdb.iamidiotareyoutoo.com/search?q=${encodeURIComponent(query)}`);
      const data = await resp.json();
      if (data.ok && data.description) {
        setSearchResults(data.description);
      }
    } catch (e) {
      console.warn("Search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMagicFetch = () => {
    if (!title) return;
    if (title.startsWith('http')) {
      try {
        const url = new URL(title);
        let name = '';
        if (url.hostname.includes('google')) {
          name = url.searchParams.get('q');
        } else if (url.hostname.includes('imdb')) {
          const parts = url.pathname.split('/');
          name = parts.find(p => p.startsWith('tt')) ? parts[parts.indexOf(parts.find(p => p.startsWith('tt'))) - 1] : parts[parts.length - 2];
        }
        if (name) {
          const cleanName = name.replace(/\+/g, ' ').replace(/-/g, ' ');
          setTitle(titleCase(cleanName));
          performSearch(cleanName);
        }
      } catch (e) { }
    } else {
      performSearch(title);
    }
  };

  const handleSelectResult = (res) => {
    setTitle(res["#TITLE"]);
    setExtra(res["#YEAR"]);
    setPosterUrl(res["#IMG_POSTER"]);
    setSearchResults([]);
    if (res["#ACTORS"]) setNote(`Starring: ${res["#ACTORS"]}`);
  };

  return (
    <form className="add-recipe-form" style={{ position: 'relative', paddingTop: 10 }} onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        title,
        note,
        posterUrl,
        synopsis,
        rating,
        genres,
        remarks,
        language,
        [type === 'movies' ? 'year' : 'seasons']: extra,
        updatedAt: Date.now()
      });
    }}>
      <div className="auth-input-group" style={{ position: 'relative', marginBottom: 25 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input className="meal-slot-input" value={title} onChange={e => setTitle(e.target.value)}
            placeholder={type === 'movies' ? "Enter Movie Name or Link..." : "Enter Series Name or Link..."}
            required style={{ flex: 1, fontSize: '16px', padding: '16px 20px', borderRadius: '18px' }} />
          <button type="button" className="magic-fetch-btn" onClick={handleMagicFetch}
            style={{ marginBottom: 0, padding: '0 20px', borderRadius: '18px', opacity: isSearching ? 0.6 : 1 }} disabled={isSearching}>
            {isSearching ? <RotateCw size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results-overlay" style={{ top: '100%', zIndex: 3000 }}>
            {searchResults.map((res, i) => (
              <div key={i} className="search-result-item" onClick={() => handleSelectResult(res)}>
                {res["#IMG_POSTER"] ? <img src={res["#IMG_POSTER"]} alt="" /> : <div className="res-img-placeholder"><Film size={20} /></div>}
                <div style={{ flex: 1 }}>
                  <div className="res-title">{res["#TITLE"]}</div>
                  <div className="res-meta">{res["#YEAR"]} • {res["#ACTORS"]}</div>
                </div>
              </div>
            ))}
            <button className="res-close-btn" onClick={() => setSearchResults([])}>Close Results</button>
          </div>
        )}
      </div>

      {type === 'series' && (
        <div className="auth-input-group" style={{ marginBottom: 25 }}>
          <label style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: 8, display: 'block', fontWeight: 700 }}>Personal Remarks / Progress</label>
          <textarea
            className="meal-slot-input"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            placeholder="e.g. S02 E05, or 'Must watch with friends'"
            style={{ height: 80, padding: '15px', borderRadius: '18px', fontSize: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#fff', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      )}

      <div className="auth-input-group" style={{ marginBottom: 25 }}>
        <label style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: 8, display: 'block', fontWeight: 700 }}>Language</label>
        <input
          className="meal-slot-input"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          placeholder="e.g. English, Hindi, Korean"
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: '18px', padding: '15px', fontSize: '14px' }}
        />
      </div>

      <button type="submit" className="auth-btn" style={{ borderRadius: '18px', padding: '16px', fontWeight: 900 }}>
        {initialData ? 'Update Item' : `Add ${type === 'movies' ? 'Movie' : 'Series'}`}
      </button>
    </form>
  );
}
function SeriesDetailView({ series, onUpdate, onBack }) {
  const [activeSeasonId, setActiveSeasonId] = useState(null);
  const [promptData, setPromptData] = useState(null); // { seasonId, count } or null

  const seasons = Array.isArray(series?.seasons) ? series.seasons : [];
  const activeSeason = seasons.find(s => s.id === activeSeasonId);

  useEffect(() => {
    console.log("SeriesDetailView mounted for:", series?.title);
  }, [series]);

  const addSeason = () => {
    const nextNum = seasons.length + 1;
    const newSeason = {
      id: Date.now(),
      number: nextNum,
      episodes: []
    };
    onUpdate({ ...series, seasons: [...seasons, newSeason] });
  };

  const addEpisodes = (seasonId, count) => {
    const season = seasons.find(s => s.id === seasonId);
    if (!season) return;
    
    const startNum = (season.episodes || []).length + 1;
    const newEpisodes = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      number: startNum + i,
      watched: false
    }));
    
    const updatedSeasons = seasons.map(s => 
      s.id === seasonId ? { ...s, episodes: [...(s.episodes || []), ...newEpisodes] } : s
    );
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  const toggleEpisode = (seasonId, epId) => {
    const updatedSeasons = seasons.map(s => {
      if (s.id === seasonId) {
        const updatedEpisodes = (s.episodes || []).map(e => 
          e.id === epId ? { ...e, watched: !e.watched } : e
        );
        return { ...s, episodes: updatedEpisodes };
      }
      return s;
    });
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  const toggleSeason = (seasonId, watched) => {
    const updatedSeasons = seasons.map(s => {
      if (s.id === seasonId) {
        const updatedEpisodes = (s.episodes || []).map(e => ({ ...e, watched }));
        return { ...s, episodes: updatedEpisodes };
      }
      return s;
    });
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  const deleteSeason = (seasonId) => {
    if (!confirm('Are you sure you want to delete this season and all its episodes?')) return;
    const updatedSeasons = seasons.filter(s => s.id !== seasonId);
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  if (activeSeason) {
    return (
      <div className="series-detail-view tab-page">
        {series.posterUrl && (
          <div className="series-detail-bg">
            <img src={series.posterUrl} alt="" />
            <div className="series-detail-overlay" />
          </div>
        )}
        <div className="tab-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="back-circle-btn" onClick={() => setActiveSeasonId(null)}>
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="tab-page-title">S {(activeSeason.number || 0).toString().padStart(2, '0')}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p className="tab-page-sub">{series.title}</p>
                <button 
                  className="link-icon-btn" 
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(series.title)}+series`, '_blank')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', padding: 0 }}
                >
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
          <button className="fab-sm" onClick={() => setPromptData({ seasonId: activeSeason.id })}>
            <Plus size={18} />
          </button>
        </div>

        <div className="episode-list">
          {(activeSeason.episodes || []).length === 0 ? (
            <div className="empty-state" style={{ marginTop: 60 }}>
              <Tv size={48} className="empty-icon" />
              <p>No episodes added yet</p>
              <button className="primary-btn" onClick={() => setPromptData({ seasonId: activeSeason.id })} style={{ marginTop: 20 }}>Add Episodes</button>
            </div>
          ) : (
            (activeSeason.episodes || []).map(ep => (
              <div key={ep.id} className="episode-row" onClick={() => toggleEpisode(activeSeason.id, ep.id)}>
                <div className="episode-info">
                  <span className="episode-num">E {(ep.number || 0).toString().padStart(2, '0')}</span>
                </div>
                <div className={`episode-checkbox ${ep.watched ? 'checked' : ''}`}>
                  {ep.watched && <Check size={14} />}
                </div>
              </div>
            ))
          )}
        </div>

        <AnimatePresence>
          {promptData && (
            <NumberModal 
              title="Add Episodes"
              message="How many episodes to add?"
              onConfirm={(count) => {
                addEpisodes(promptData.seasonId, count);
                setPromptData(null);
              }}
              onCancel={() => setPromptData(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const totalEpisodes = seasons.reduce((acc, s) => acc + (s.episodes || []).length, 0);

  return (
    <div className="series-detail-view tab-page">
      {series.posterUrl && (
        <div className="series-detail-bg">
          <img src={series.posterUrl} alt="" />
          <div className="series-detail-overlay" />
        </div>
      )}
      <div className="tab-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-circle-btn" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="tab-page-title">{series.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p className="tab-page-sub">{seasons.length} Seasons • {totalEpisodes} Episodes</p>
              <button 
                className="link-icon-btn" 
                onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(series.title)}+series`, '_blank')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
        <button className="fab-sm" onClick={addSeason}>
          <Plus size={18} />
        </button>
      </div>

      <div className="season-list">
        {seasons.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            <Tv size={48} className="empty-icon" />
            <p>No seasons added yet</p>
            <button className="primary-btn" onClick={addSeason} style={{ marginTop: 20 }}>Add Season 1</button>
          </div>
        ) : (
          seasons.map(s => {
            const epList = s.episodes || [];
            const watchedCount = epList.filter(e => e.watched).length;
            const totalCount = epList.length;
            const isFullyWatched = totalCount > 0 && watchedCount === totalCount;
            
            return (
              <div key={s.id} className="season-card" onClick={() => setActiveSeasonId(s.id)}>
                <div className="season-info">
                  <span className="season-num">S {(s.number || 0).toString().padStart(2, '0')}</span>
                  <span className="season-progress">{watchedCount}/{totalCount} Episodes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button 
                    className={`season-toggle ${isFullyWatched ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSeason(s.id, !isFullyWatched);
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    className="delete-circle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSeason(s.id);
                    }}
                    style={{ width: 44, height: 44, borderRadius: 14, border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
        })
      )}
    </div>

      <AnimatePresence>
        {promptData && (
          <NumberModal 
            title="Add Episodes"
            message="How many episodes to add?"
            onConfirm={(count) => {
              addEpisodes(promptData.seasonId, count);
              setPromptData(null);
            }}
            onCancel={() => setPromptData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NumberModal({ title, message, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  
  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
        <h3>{title}</h3>
        <p>{message}</p>
        <input 
          type="number" 
          inputMode="numeric" 
          pattern="[0-9]*"
          autoFocus 
          placeholder="Enter number..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="modal-input"
          style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '18px', textAlign: 'center', marginBottom: '20px' }}
        />
        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn confirm" onClick={() => {
            const num = parseInt(value);
            if (num > 0) onConfirm(num);
          }}>Add</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PlanWatchTab({ type, items, setItems, selectedId, setSelectedId }) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('to-watch');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedLang, setSelectedLang] = useState('All');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'az'
  const [filterNotFinished, setFilterNotFinished] = useState(false);
  const [isLangsExpanded, setIsLangsExpanded] = useState(false);
  const lastSelectedId = useRef(null);

  useEffect(() => {
    if (!selectedId && lastSelectedId.current) {
      setTimeout(() => {
        const el = document.getElementById(`watch-card-${lastSelectedId.current}`);
        if (el) el.scrollIntoView({ behavior: 'auto', block: 'center' });
        lastSelectedId.current = null;
      }, 50);
    }
    if (selectedId) {
      lastSelectedId.current = selectedId;
    }
  }, [selectedId]);

  const handleAdd = (data) => {
    const isDuplicate = items.some(i => i.title.toLowerCase() === data.title.toLowerCase());
    if (isDuplicate) {
      alert(`"${data.title}" is already in your ${type} list!`);
      return;
    }
    const newItem = { id: Date.now(), ...data, completed: false, favorite: false };
    setItems([newItem, ...items]);
    setShowForm(false);
  };

  const handleToggle = (id) => {
    if (type === 'movies') {
      handleDelete(id);
    } else {
      setItems(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
    }
  };
  const handleToggleFavorite = (id) => setItems(items.map(i => i.id === id ? { ...i, favorite: !i.favorite } : i));
  const handleDelete = (id) => setItems(items.filter(i => i.id !== id));

  const allLangs = ['All', ...new Set(items.map(i => i.language).filter(Boolean))];

  const filtered = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === 'All' || i.language === selectedLang;
    const matchesNotFinished = !filterNotFinished || (
      type === 'series' && 
      Array.isArray(i.seasons) && 
      i.seasons.length > 0 && 
      i.seasons.some(s => (s.episodes || []).some(e => !e.watched))
    );
    
    if (type === 'movies') return matchesSearch && matchesLang; // Movies don't use tabs or finished filter
    const matchesView = view === 'to-watch' ? !i.completed : i.completed;
    return matchesSearch && matchesLang && matchesView && matchesNotFinished;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return (Number(b.id) || 0) - (Number(a.id) || 0); // Newer first
  });

  const selectedSeries = type === 'series' && selectedId ? items.find(i => String(i.id) === String(selectedId)) : null;

  const handleUpdateSeries = (updatedSeries) => {
    setItems(items.map(i => i.id === updatedSeries.id ? updatedSeries : i));
  };

  useEffect(() => {
    if (selectedId) {
      console.log("Selected ID:", selectedId, "Found series:", selectedSeries?.title);
    }
  }, [selectedId, selectedSeries]);

  if (selectedId && !selectedSeries) {
    return (
      <div className="tab-page">
        <div className="empty-state">
          <Tv size={48} className="empty-icon" />
          <p>Series not found (ID: {selectedId})</p>
          <button className="primary-btn" onClick={() => setSelectedId(null)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (selectedSeries) {
    return (
      <SeriesDetailView 
        series={selectedSeries} 
        onUpdate={handleUpdateSeries} 
        onBack={() => setSelectedId(null)} 
      />
    );
  }

  return (
    <div className="tab-page watch-tab-page">
      {!showForm && (
        <button className="fab-main" onClick={() => setShowForm(true)} title={`Add ${type === 'movies' ? 'Movie' : 'Series'}`}>
          <Plus size={24} />
        </button>
      )}

      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">{type === 'movies' ? 'Movies' : 'Series'}</h2>
          <p className="tab-page-sub">
            {type === 'movies' ? `Watchlist : ${filtered.length} Movies` : (view === 'to-watch' ? `Watchlist : ${filtered.length} Series` : `Watched : ${filtered.length} Series`)}
          </p>
          {type === 'series' && view === 'watched' && (
            <p className="tab-page-sub" style={{ marginTop: 2, fontSize: 11, color: 'var(--text-3)' }}>
              {(() => {
                const totalS = items.reduce((acc, item) => {
                  if (!Array.isArray(item.seasons)) return acc;
                  return acc + item.seasons.filter(s => (s.episodes || []).length > 0 && (s.episodes || []).every(e => e.watched)).length;
                }, 0);
                const totalE = items.reduce((acc, item) => {
                  if (!Array.isArray(item.seasons)) return acc;
                  return acc + item.seasons.reduce((eAcc, s) => eAcc + (s.episodes || []).filter(e => e.watched).length, 0);
                }, 0);
                return `${totalS} Seasons - ${totalE} Episodes`;
              })()}
            </p>
          )}
        </div>
        <div className="tab-header-actions">
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 10 }}>
        <Search size={16} className="search-icon" />
        <input className="search-input" placeholder={`Search your ${type}...`} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {type === 'series' && (
        <div className="next-bites-sub-nav" style={{ marginBottom: 15 }}>
          <button className={`sub-nav-btn ${view === 'to-watch' ? 'active' : ''}`} onClick={() => setView('to-watch')}>
            Watchlist ({items.filter(i => !i.completed).length})
          </button>
          <button className={`sub-nav-btn ${view === 'watched' ? 'active' : ''}`} onClick={() => setView('watched')}>
            Watched ({items.filter(i => i.completed).length})
          </button>
        </div>
      )}

      {allLangs.length > 1 && (
        <div className="language-filter-wrap" style={{ marginBottom: 15 }}>
          <div 
            className={`language-filter-bar ${isLangsExpanded ? 'expanded' : ''}`}
            onClick={() => setIsLangsExpanded(!isLangsExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Languages size={16} className="filter-icon" />
              <span className="filter-label">
                {selectedLang === 'All' ? `All Languages (${allLangs.length - 1})` : `Language: ${selectedLang}`}
              </span>
            </div>
            <button className="expand-toggle-btn">
              {isLangsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {isLangsExpanded && (
            <div className="filter-tags-scroll expanded" style={{ marginTop: 10 }}>
              {allLangs
                .filter(lang => {
                  if (lang === 'All') return true;
                  return items.some(i => {
                    const matchesLang = i.language === lang;
                    if (type === 'movies') return matchesLang;
                    const matchesView = view === 'to-watch' ? !i.completed : i.completed;
                    return matchesLang && matchesView;
                  });
                })
                .map(lang => ({
                  name: lang,
                  count: items.filter(i => {
                    const matchesLang = lang === 'All' || i.language === lang;
                    if (type === 'movies') return matchesLang;
                    const matchesView = view === 'to-watch' ? !i.completed : i.completed;
                    return matchesLang && matchesView;
                  }).length
                }))
                .sort((a, b) => {
                  if (a.name === 'All') return -1;
                  if (b.name === 'All') return 1;
                  return b.count - a.count;
                })
                .map(({ name, count }) => (
                  <button
                    key={name}
                    className={`filter-tag ${selectedLang === name ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLang(name);
                      // Optional: setIsLangsExpanded(false); 
                    }}
                  >
                    {name} ({count})
                  </button>
                ))
              }
            </div>
          )}
        </div>
      )}

      <div className="sort-pills-container" style={{ display: 'flex', gap: 10, marginBottom: 20, padding: '0 4px', overflowX: 'auto', whiteSpace: 'nowrap', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', alignSelf: 'center', marginRight: 4 }}>Sort By:</span>
        <button className={`sort-pill ${sortBy === 'date' ? 'active' : ''}`} onClick={() => setSortBy('date')}>
          <Clock size={12} /> <span>Recent</span>
        </button>
        <button className={`sort-pill ${sortBy === 'az' ? 'active' : ''}`} onClick={() => setSortBy('az')}>
          <ArrowDownAZ size={12} /> <span>A-Z</span>
        </button>
        {type === 'series' && view === 'watched' && (
          <button className={`sort-pill ${filterNotFinished ? 'active' : ''}`} onClick={() => setFilterNotFinished(!filterNotFinished)}>
            <Sparkles size={12} /> <span>Not Finished</span>
          </button>
        )}
      </div>

      <div className="watch-deck-container">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 60 }}>
            {type === 'movies' ? <Film size={48} className="empty-icon" /> : <Tv size={48} className="empty-icon" />}
            <p>Your {type} list is empty</p>
            <span>Start by adding something you want to watch</span>
          </div>
        ) : (
          <div className="watch-deck">
            {sortedFiltered.map(item => (
              <WatchCardLarge
                key={item.id}
                item={item}
                type={type}
                view={view}
                onEdit={() => setEditingItem(item)}
                onDelete={() => setDeletingId(item.id)}
                onToggleComplete={() => handleToggle(item.id)}
                onClick={() => type === 'series' && setSelectedId(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={`Add ${type === 'movies' ? 'Movie' : 'Series'}`}>
        <AddWatchItemForm type={type} onSubmit={handleAdd} />
      </Modal>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={`Edit ${type === 'movies' ? 'Movie' : 'Series'}`}>
        <AddWatchItemForm type={type} initialData={editingItem} onSubmit={(data) => {
          setItems(items.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
          setEditingItem(null);
        }} />
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => { handleDelete(deletingId); setDeletingId(null); }}
        title="Finished watching?"
        message={`Are you sure you want to remove this from your list?`}
      />
    </div>
  );
}

function DestinationCard({ dest, onClick, onUpdate, onDelete, onEdit }) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item
      value={dest}
      dragListener={false}
      dragControls={dragControls}
      className="watch-card-large"
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 40px rgba(0,0,0,0.6)", zIndex: 100 }}
      onClick={onClick}
    >
      <div className="watch-card-inner">
        {dest.coverImage ? (
          <img src={dest.coverImage} alt="" className="watch-poster-bg" />
        ) : (
          <div className="watch-card-placeholder">
            <Plane size={60} />
            <span style={{ marginTop: 15, fontWeight: 700, opacity: 0.5 }}>ADD COVER</span>
          </div>
        )}
        <div className="watch-overlay-large" />

        {/* Drag Handle (Top Left) */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          style={{
            position: 'absolute', top: 15, left: 15, zIndex: 10,
            width: 40, height: 40, borderRadius: '12px',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            touchAction: 'none'
          }}
        >
          <GripVertical size={20} />
        </div>

        {/* Action Menu (Top Right) */}
        <div onClick={e => e.stopPropagation()} style={{
          position: 'absolute', top: 15, right: 15, zIndex: 10,
          width: 40, height: 40, borderRadius: '12px',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <ActionMenu
            onVisited={() => onUpdate(dest.id, 'visited', !dest.visited)}
            isVisited={dest.visited}
            visitedLabel={dest.visited ? "Mark as Not Visited" : "Mark as Visited"}
            onEdit={onEdit}
            onDelete={() => onDelete(dest.id)}
          />
        </div>

        <div className="watch-content-large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div className="watch-title-large">{dest.name}</div>
          </div>

          <div className="watch-meta-large">
            <MapPin size={14} />
            <span>{dest.category === 'domestic' ? 'Domestic' : 'International'}</span>
          </div>

          <div className="watch-synopsis-large" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 15 }}>
            {dest.budget?.total > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '6px 12px', borderRadius: '12px',
                color: '#10b981', fontSize: '15px', fontWeight: '800'
              }}>
                <IndianRupee size={14} />
                <span>₹{dest.budget.total}</span>
              </div>
            )}
            {dest.season && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '6px 12px', borderRadius: '12px',
                color: '#3b82f6', fontSize: '13px', fontWeight: '700'
              }}>
                <Sun size={14} />
                <span>{dest.season}</span>
              </div>
            )}
            {!dest.budget?.total && !dest.season && (
              <span style={{ opacity: 0.4, fontSize: '12px', fontStyle: 'italic' }}>No planning details added yet...</span>
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

function PlanGoTab({ destinations, setDestinations, filter, selectedId, setSelectedId }) {
  const [activeTab, setActiveTab] = useState('places');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showVisited, setShowVisited] = useState(false);
  const [newDestination, setNewDestination] = useState({ name: '', category: 'domestic', coverImage: '', budgetVal: '', season: '' });

  const selected = destinations.find(d => d.id === selectedId);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewDestination(prev => ({ ...prev, coverImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDestination = () => {
    if (editingItem) {
      setDestinations(destinations.map(d => d.id === editingItem.id ? { ...d, ...newDestination } : d));
    } else {
      const dest = {
        ...newDestination,
        id: Date.now().toString(),
        places: [],
        activities: [],
        food: [],
        stay: [],
        notes: '',
        budget: { total: newDestination.budgetVal || 0, breakdown: '' }
      };
      setDestinations([...destinations, dest]);
    }
    setShowAddModal(false);
    setEditingItem(null);
    setNewDestination({ name: '', category: 'domestic', coverImage: '', budgetVal: '', season: '' });
  };

  const updateDestination = (id, field, val) => {
    setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: val } : d));
  };

  const addItem = (field) => {
    if (field === 'references') {
      const url = prompt('Enter website or video link:');
      if (!url) return;
      const remarks = prompt('Enter remarks (e.g. YouTube Video, Best Reel):');
      if (!remarks) return;
      const items = selected[field] || [];
      updateDestination(selectedId, field, [...items, { id: Date.now().toString(), title: remarks, link: url }]);
    } else {
      const promptMsg = field === 'notes' ? 'Enter your note:' : `Add to ${field}:`;
      const val = prompt(promptMsg);
      if (!val) return;
      const items = selected[field] || [];
      updateDestination(selectedId, field, [...items, { id: Date.now().toString(), title: val, note: '' }]);
    }
  };

  const deleteItem = (field, itemId) => {
    const items = selected[field].filter(i => i.id !== itemId);
    updateDestination(selectedId, field, items);
  };

  const updateItemRemark = (field, itemId) => {
    const item = selected[field].find(i => i.id === itemId);
    const remark = prompt('Enter remark:', item?.note || '');
    if (remark === null) return;
    const items = selected[field].map(i => i.id === itemId ? { ...i, note: remark } : i);
    updateDestination(selectedId, field, items);
  };

  const updateBudgetRemark = (catId) => {
    const current = selected.budget?.[`${catId}_remark`] || '';
    const remark = prompt('Enter remark:', current);
    if (remark === null) return;
    const newBudget = { ...selected.budget, [`${catId}_remark`]: remark };
    updateDestination(selectedId, 'budget', newBudget);
  };

  const updateCustomRemark = (idx) => {
    const current = selected.budget?.customExpenses?.[idx]?.remark || '';
    const remark = prompt('Enter remark:', current);
    if (remark === null) return;
    const newCustom = [...(selected.budget?.customExpenses || [])];
    newCustom[idx] = { ...newCustom[idx], remark };
    updateDestination(selectedId, 'budget', { ...selected.budget, customExpenses: newCustom });
  };

  if (selected) {
    return (
      <div className="plango-container">
        <div className="dashboard-hero">
          {selected.coverImage && <img src={selected.coverImage} alt="" className="dashboard-hero-bg" />}
          <div className="dashboard-hero-overlay" />
          <button className="dashboard-back-btn" onClick={() => setSelectedId(null)}>
            <ChevronLeft size={24} />
          </button>
          <div className="dashboard-hero-content">
            <div className="dashboard-subtitle">{selected.category} TRIP</div>
            <h2 className="dashboard-title">{selected.name}</h2>
          </div>
        </div>

        <div className="dashboard-tabs">
          {[
            { id: 'places', label: 'Places', icon: MapPin },
            { id: 'activities', label: 'Activities', icon: Sparkles },
            { id: 'food', label: 'Eat', icon: UtensilsCrossed },
            { id: 'stay', label: 'Stay', icon: Hotel },
            { id: 'notes', label: 'Notes', icon: BookOpen },
            { id: 'references', label: 'Refs', icon: Link },
            { id: 'budget', label: 'Budget', icon: IndianRupee },
          ].map(t => (
            <button key={t.id} className={`dash-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        <div className="dash-content-area">
          {['places', 'activities', 'food', 'stay', 'notes', 'references'].includes(activeTab) && (
            <div className="dash-content-list">
              <button className="fab-main" onClick={() => addItem(activeTab)} title={`Add ${activeTab}`}>
                <Plus size={24} />
              </button>
              {(() => {
                const TabIcon = [
                  { id: 'places', icon: MapPin },
                  { id: 'activities', icon: Sparkles },
                  { id: 'food', icon: UtensilsCrossed },
                  { id: 'stay', icon: Hotel },
                  { id: 'notes', icon: BookOpen },
                  { id: 'references', icon: Link }
                ].find(t => t.id === activeTab)?.icon || MapPin;

                const items = Array.isArray(selected[activeTab]) ? selected[activeTab] : [];

                if (items.length === 0) {
                  return (
                    <div className="empty-state" style={{ marginTop: 80, opacity: 0.4, textAlign: 'center' }}>
                      <TabIcon size={48} style={{ marginBottom: 15 }} />
                      <p>{activeTab === 'notes' ? "Capture your trip thoughts here..." : `No ${activeTab} planned yet`}</p>
                    </div>
                  );
                }
                return items.map(item => (
                  <div
                    key={item.id}
                    className="dash-card"
                    onClick={() => {
                      if (activeTab === 'references' && item.link) {
                        window.open(item.link.startsWith('http') ? item.link : `https://${item.link}`, '_blank');
                      }
                    }}
                    style={activeTab === 'references' ? { cursor: 'pointer' } : {}}
                  >
                    <div className="dash-card-icon">
                      <TabIcon size={18} />
                    </div>
                    <div className="dash-card-content">
                      <div className="dash-card-title">{item.title}</div>
                      {(item.note || item.link) && (
                        <div className="dash-card-note">
                          {activeTab === 'references' ? (
                            <span style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '12px', opacity: 0.8 }}>{item.link}</span>
                          ) : item.note}
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: -4 }} onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        onRemark={() => updateItemRemark(activeTab, item.id)}
                        onDelete={() => deleteItem(activeTab, item.id)}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}



          {activeTab === 'budget' && (
            <div className="budget-view" style={{ padding: '10px 5px' }}>
              <div className="budget-summary-hero" style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0) 100%)',
                padding: '30px 20px',
                borderRadius: '30px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                textAlign: 'center',
                marginBottom: 30
              }}>
                <div className="budget-label" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: 10 }}>Total Estimated Budget</div>
                <div className="budget-value" style={{ fontSize: 42, color: 'var(--primary)', fontWeight: 900, textShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                  ₹{
                    (Number(selected.budget?.travel || 0) +
                      Number(selected.budget?.stay || 0) +
                      Number(selected.budget?.food || 0) +
                      Number(selected.budget?.extras || 0) +
                      (selected.budget?.customExpenses || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0)) || selected.budget?.total || 0
                  }
                </div>
              </div>

              <div className="budget-breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { id: 'travel', label: 'Travel', icon: Plane, color: '#3b82f6' },
                  { id: 'stay', label: 'Stay', icon: Hotel, color: '#10b981' },
                  { id: 'food', label: 'Food', icon: UtensilsCrossed, color: '#f59e0b' },
                ].filter(cat => !(selected.budget?.hiddenCategories || []).includes(cat.id)).map(cat => (
                  <div key={cat.id} className="budget-item-card" style={{
                    display: 'flex', alignItems: 'center', gap: 15,
                    background: 'rgba(255,255,255,0.03)',
                    padding: '18px 20px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '16px',
                      background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: cat.color
                    }}>
                      <cat.icon size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>{cat.label}</div>
                      {selected.budget?.[`${cat.id}_remark`] && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: 2, fontStyle: 'italic' }}>
                          {selected.budget[`${cat.id}_remark`]}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '14px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: cat.color }}>₹</span>
                      <input
                        type="number"
                        className="budget-inline-input"
                        style={{ width: 80, border: 'none', padding: 0, background: 'transparent', fontSize: '18px', fontWeight: 900, color: '#fff', textAlign: 'right' }}
                        value={selected.budget?.[cat.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newBudget = { ...selected.budget, [cat.id]: val };
                          const customSum = (newBudget.customExpenses || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !(newBudget.hiddenCategories || []).includes(c)).reduce((acc, curr) => acc + Number(newBudget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...newBudget, total: coreSum + customSum });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div style={{ marginLeft: 10 }}>
                      <ActionMenu
                        onRemark={() => updateBudgetRemark(cat.id)}
                        onDelete={() => {
                          const newHidden = [...(selected.budget?.hiddenCategories || []), cat.id];
                          const newBudget = { ...selected.budget, hiddenCategories: newHidden, [cat.id]: '' };
                          const customSum = (newBudget.customExpenses || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !newHidden.includes(c)).reduce((acc, curr) => acc + Number(newBudget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...newBudget, total: coreSum + customSum });
                        }}
                      />
                    </div>
                  </div>
                ))}

                {(selected.budget?.customExpenses || []).map((exp, idx) => (
                  <div key={idx} className="budget-item-card" style={{
                    display: 'flex', alignItems: 'center', gap: 15,
                    background: 'rgba(255,255,255,0.03)',
                    padding: '18px 20px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '16px',
                      background: `rgba(255,255,255,0.05)`, border: `1px solid rgba(255,255,255,0.1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-dim)'
                    }}>
                      <Tag size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>{exp.name}</div>
                      {exp.remark && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: 2, fontStyle: 'italic' }}>
                          {exp.remark}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '14px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, opacity: 0.5 }}>₹</span>
                      <input
                        type="number"
                        className="budget-inline-input"
                        style={{ width: 80, border: 'none', padding: 0, background: 'transparent', fontSize: '18px', fontWeight: 900, color: '#fff', textAlign: 'right' }}
                        value={exp.value || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newCustom = [...(selected.budget.customExpenses || [])];
                          newCustom[idx] = { ...newCustom[idx], value: val };
                          const customSum = newCustom.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !(selected.budget.hiddenCategories || []).includes(c)).reduce((acc, curr) => acc + Number(selected.budget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...selected.budget, customExpenses: newCustom, total: coreSum + customSum });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div style={{ marginLeft: 10 }}>
                      <ActionMenu
                        onRemark={() => updateCustomRemark(idx)}
                        onDelete={() => {
                          const newCustom = selected.budget.customExpenses.filter((_, i) => i !== idx);
                          const customSum = newCustom.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !(selected.budget.hiddenCategories || []).includes(c)).reduce((acc, curr) => acc + Number(selected.budget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...selected.budget, customExpenses: newCustom, total: coreSum + customSum });
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Extras always at the bottom */}
                {!(selected.budget?.hiddenCategories || []).includes('extras') && (
                  <div className="budget-item-card" style={{
                    display: 'flex', alignItems: 'center', gap: 15,
                    background: 'rgba(255,255,255,0.03)',
                    padding: '18px 20px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '16px',
                      background: `#8b5cf615`, border: `1px solid #8b5cf630`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#8b5cf6'
                    }}>
                      <Sparkles size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, opacity: 0.8 }}>Extras</div>
                      {selected.budget?.extras_remark && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: 2, fontStyle: 'italic' }}>
                          {selected.budget.extras_remark}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.2)', padding: '10px 16px', borderRadius: '14px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#8b5cf6' }}>₹</span>
                      <input
                        type="number"
                        className="budget-inline-input"
                        style={{ width: 80, border: 'none', padding: 0, background: 'transparent', fontSize: '18px', fontWeight: 900, color: '#fff', textAlign: 'right' }}
                        value={selected.budget?.extras || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newBudget = { ...selected.budget, extras: val };
                          const customSum = (newBudget.customExpenses || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !(newBudget.hiddenCategories || []).includes(c)).reduce((acc, curr) => acc + Number(newBudget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...newBudget, total: coreSum + customSum });
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div style={{ marginLeft: 10 }}>
                      <ActionMenu
                        onRemark={() => updateBudgetRemark('extras')}
                        onDelete={() => {
                          const newHidden = [...(selected.budget?.hiddenCategories || []), 'extras'];
                          const newBudget = { ...selected.budget, hiddenCategories: newHidden, extras: '' };
                          const customSum = (newBudget.customExpenses || []).reduce((acc, curr) => acc + Number(curr.value || 0), 0);
                          const coreSum = ['travel', 'stay', 'food', 'extras'].filter(c => !newHidden.includes(c)).reduce((acc, curr) => acc + Number(newBudget[curr] || 0), 0);
                          updateDestination(selectedId, 'budget', { ...newBudget, total: coreSum + customSum });
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  className="btn-ghost"
                  style={{ marginTop: 10, padding: '15px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)', width: '100%', color: 'var(--text-dim)' }}
                  onClick={() => {
                    const name = prompt('Expense name:');
                    if (!name) return;
                    const newCustom = [...(selected.budget?.customExpenses || []), { name, value: '' }];
                    updateDestination(selectedId, 'budget', { ...selected.budget, customExpenses: newCustom });
                  }}
                >
                  <Plus size={16} style={{ marginRight: 8 }} /> Add Custom Expense
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: showVisited ? 'Visited' : (filter === 'domestic' ? 'Domestic' : 'International'),
      items: destinations
        .filter(d => d.category === filter && !!d.visited === showVisited)
    }
  ];

  return (
    <div className="plango-container">
      {!selectedId && (
        <button className="fab-main" onClick={() => setShowAddModal(true)} title="Add Destination">
          <Plus size={24} />
        </button>
      )}

      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">PlanGo</h2>
          <p className="tab-page-sub">{showVisited ? 'Your travel memories' : 'Your travel bucket list'}</p>
        </div>
        <button
          className={`filter-tag ${showVisited ? 'active' : ''}`}
          onClick={() => setShowVisited(!showVisited)}
          style={{ 
            marginBottom: 0, 
            padding: '6px 0', 
            fontSize: '11px', 
            width: '110px', 
            minWidth: '110px',
            height: '34px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          {showVisited ? 'Not Visited' : 'Visited'}
        </button>
      </div>

      <Reorder.Group axis="y" values={sections[0].items} onReorder={(newItems) => {
        const others = destinations.filter(d => d.category !== filter || !!d.visited !== showVisited);
        setDestinations([...newItems, ...others]);
      }} className="watch-deck">
        {sections[0].items.length === 0 ? (
          <div className="empty-state-mini" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>No {sections[0].title.toLowerCase()} trips planned</div>
        ) : (
          sections[0].items.map(dest => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              onClick={() => setSelectedId(dest.id)}
              onUpdate={updateDestination}
              onDelete={(id) => { if (confirm('Delete destination?')) setDestinations(destinations.filter(d => d.id !== id)) }}
              onEdit={() => {
                setEditingItem(dest);
                setNewDestination({
                  name: dest.name,
                  category: dest.category,
                  coverImage: dest.coverImage,
                  budgetVal: dest.budget?.total || '',
                  season: dest.season || ''
                });
                setShowAddModal(true);
              }}
            />
          ))
        )}
      </Reorder.Group>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingItem(null); }} title={editingItem ? "Edit Destination" : "New Destination"}>
        <div className="auth-form">
          <div className="auth-input-group">
            <label>Where to?</label>
            <input className="meal-slot-input" value={newDestination.name} onChange={e => setNewDestination({ ...newDestination, name: e.target.value })} placeholder="e.g. Goa, Paris" />
          </div>
          <div className="auth-input-group">
            <label>Category</label>
            <select className="meal-slot-input" value={newDestination.category} onChange={e => setNewDestination({ ...newDestination, category: e.target.value })}>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
          <div className="auth-input-group">
            <label>Cover Image</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label className="btn-primary-sm" style={{ cursor: 'pointer', flex: 1, textAlign: 'center' }}>
                <Camera size={16} /> {newDestination.coverImage ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              {newDestination.coverImage && (
                <div style={{ width: 50, height: 50, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <img src={newDestination.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div className="auth-input-group">
              <label>Estimated Budget (₹)</label>
              <input type="number" className="meal-slot-input" value={newDestination.budgetVal} onChange={e => setNewDestination({ ...newDestination, budgetVal: e.target.value })} placeholder="50000" />
            </div>
            <div className="auth-input-group">
              <label>Best Season</label>
              <input className="meal-slot-input" value={newDestination.season} onChange={e => setNewDestination({ ...newDestination, season: e.target.value })} placeholder="e.g. Winter" />
            </div>
          </div>
          <button className="auth-btn" onClick={handleSaveDestination}>{editingItem ? 'Save Changes' : 'Create Trip'}</button>
        </div>
      </Modal>
    </div>
  );
}

