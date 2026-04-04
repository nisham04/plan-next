import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from './firebase';
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
  RotateCw,
  MoreVertical,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const MEAL_ICONS = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon };
const MEAL_COLORS = {
  Breakfast: { bg: 'var(--meal-breakfast-bg)', border: 'var(--meal-border)', text: '#a68b36', glow: 'rgba(166,139,54,0.05)' }, // Muted Gold
  Lunch: { bg: 'var(--meal-lunch-bg)', border: 'var(--meal-border)', text: '#6e786e', glow: 'rgba(110,120,110,0.05)' }, // Sage
  Dinner: { bg: 'var(--meal-dinner-bg)', border: 'var(--meal-border)', text: '#78645a', glow: 'rgba(120,100,90,0.05)' }, // Earth
};

const EATING_OUT_PREFIX = '🍴 Eating Out: ';

const DEFAULT_MENU_CATEGORIES = ['Breakfast', 'Bread', 'Rice', 'Snack', 'Curry', 'Dessert'];

const CATEGORY_COLORS = {
  Breakfast: '#a68b36', Lunch: '#6e786e', Dinner: '#78645a',
  Snack: '#8c7340', Indian: '#a65d36', Italian: '#5a785a',
  Asian: '#5a7a7a', Other: '#5a5a60',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekKey(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + weekOffset * 7);
  return monday.toISOString().split('T')[0];
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
  const s = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const e = dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${s} – ${e}`;
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

// ─── Storage ──────────────────────────────────────────────────────────────────

const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; } };
const save = () => { }; // No-op, we'll use Firestore setters

// ─── Shared Components ────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>Syncing your kitchen...</p>
      </div>
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
          {/* Bottom sheet — translateY only, no X transform */}
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

// ─── Meal Slot ────────────────────────────────────────────────────────────────

function MealSlot({ meal, value, onChange, menuItems, onOpenPicker }) {
  const [editing, setEditing] = useState(false);
  const [isEatingOut, setIsEatingOut] = useState(false);
  const [eatingOutDetails, setEatingOutDetails] = useState('');
  const [draftDishes, setDraftDishes] = useState([]);
  const colors = MEAL_COLORS[meal];
  const Icon = MEAL_ICONS[meal];

  useEffect(() => {
    if (editing) {
      if (value?.startsWith(EATING_OUT_PREFIX)) {
        setIsEatingOut(true);
        setEatingOutDetails(value.replace(EATING_OUT_PREFIX, ''));
        setDraftDishes(['']);
      } else {
        setIsEatingOut(false);
        setEatingOutDetails('');
        const initial = value ? value.split(',').map(d => d.trim()).filter(Boolean) : [''];
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

  const dishes = value ? value.split(',').map(d => d.trim()).filter(Boolean) : [];

  return (
    <div className={`meal-slot ${value?.startsWith(EATING_OUT_PREFIX) ? 'is-eating-out' : ''}`} 
      style={{ '--slot-bg': colors.bg, '--slot-border': colors.border, '--slot-text': colors.text }}>
      <div className="meal-slot-label"><Icon size={11} style={{ color: colors.text }} /><span>{meal}</span></div>
      {editing ? (
        <div className="meal-slot-input-wrap multi-input">
          {isEatingOut ? (
            <div className="meal-input-group">
              <label className="eating-out-label">Restaurant / Details</label>
              <input className="meal-slot-input eating-out-input" value={eatingOutDetails} autoFocus
                onChange={e => setEatingOutDetails(e.target.value)} onKeyDown={e => e.key === 'Enter' && commit()}
                placeholder="Where are you eating?" maxLength={60} />
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
              {!isEatingOut && (
                <button className="slot-action-btn picker" onClick={(e) => { e.preventDefault(); onOpenPicker(); }} title="Select from saved menu">
                  <UtensilsCrossed size={14} />
                </button>
              )}
              <button className="slot-action-btn confirm" onClick={commit}><Check size={14} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="meal-slot-display-container">
          <button className={`meal-slot-display ${dishes.length > 0 ? 'filled' : 'empty'}`} onClick={() => setEditing(true)}>
            {value?.startsWith(EATING_OUT_PREFIX) ? (
              <div className="eating-out-badge">
                <div className="eating-out-title">Dining Out</div>
                <div className="eating-out-details">{value.replace(EATING_OUT_PREFIX, '')}</div>
              </div>
            ) : dishes.length > 0 ? (
              <div className="meal-chips">
                {dishes.map((d, i) => (
                  <span key={i} className="meal-chip">
                    {d}
                    <X size={10} className="chip-del" onMouseDown={e => { e.stopPropagation(); const nd = dishes.filter((_, idx)=>idx!==i); onChange(nd.join(', ')); }} />
                  </span>
                ))}
                <Plus size={12} style={{ opacity: 0.4, marginLeft: 4 }} />
              </div>
            ) : (
              <span className="add-meal-hint"><Plus size={12} /> Add meal</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({ dayName, dayDate, meals, onMealChange, menuItems, onOpenPicker }) {
  const todayFlag = dayDate && isToday(dayDate);
  return (
    <motion.div layout className={`day-card ${todayFlag ? 'today' : ''}`}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <div className="day-header">
        <div className="day-header-left">
          <span className="day-name">{dayName}</span>
          {dayDate && <span className="day-date">{dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
          {todayFlag && <span className="today-badge">Today</span>}
        </div>
        <div className="day-progress">
          {MEALS.map(m => <div key={m} className="progress-dot" style={{ background: meals[m] ? MEAL_COLORS[m].text : 'rgba(255,255,255,0.08)' }} />)}
        </div>
      </div>
      <div className="meal-slots">
        {MEALS.map(meal => (
          <MealSlot key={meal} meal={meal} value={meals[meal]} onChange={val => onMealChange(meal, val)} menuItems={menuItems} onOpenPicker={() => onOpenPicker(meal)} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Planner Tab ─────────────────────────────────────────────────────────────

function PlannerTab({ plan, onPlanChange, menuItems, onOpenPicker }) {
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
                      <DayCard key={d.key} dayName={d.dayName} dayDate={d.date} meals={d.meals} onMealChange={(meal, val) => handleMealChange(d.dayId, meal, val)} menuItems={menuItems} onOpenPicker={(meal) => onOpenPicker({ weekKey, day: d.dayId, meal })} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {mainDays.map(d => (
          <DayCard key={d.key} dayName={d.dayName} dayDate={d.date} meals={d.meals} onMealChange={(meal, val) => handleMealChange(d.dayId, meal, val)} menuItems={menuItems} onOpenPicker={(meal) => onOpenPicker({ weekKey, day: d.dayId, meal })} />
        ))}
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ActionMenu({ onEdit, onDelete }) {
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
    <div className="action-menu-container" ref={menuRef}>
      <button className="action-menu-trigger" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical size={16} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="action-menu-dropdown">
            <button className="action-menu-item" onClick={() => { onEdit(); setIsOpen(false); }}>
              <Edit3 size={14} /> <span>Edit</span>
            </button>
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
          <button className="btn-danger-sm" onClick={onConfirm}>Delete Anyway</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

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
    setMenuItems(prev => [...prev, { ...item, id: Date.now() }]);
    setShowForm(false);
  };

  const handleDelete = (id) => setMenuItems(prev => prev.filter(m => m.id !== id));

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
                {items.map(item => (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }} className="menu-item">
                    <span className="menu-item-name">{item.name}</span>
                    <ActionMenu 
                      onEdit={() => setEditingItem(item)} 
                      onDelete={() => setDeletingId(item.id)} 
                    />
                  </motion.div>
                ))}
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

// ─── Recipes Tab ──────────────────────────────────────────────────────────────

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

function RecipeCard({ recipe, onEdit, onDelete, onToggleFavorite }) {
  const favicon = recipe.url ? getFaviconUrl(recipe.url) : null;
  const domain = recipe.url ? (() => { try { return new URL(recipe.url.startsWith('http') ? recipe.url : 'https://' + recipe.url).hostname.replace('www.', ''); } catch { return null; } })() : null;

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="recipe-card">
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
          <button className={`recipe-favorite-btn ${recipe.favourite ? 'active' : ''}`} 
            onClick={() => onToggleFavorite(recipe.id)} title="Favorite">
            <Star size={16} fill={recipe.favourite ? "currentColor" : "none"} />
          </button>
          {recipe.url && (
            <a href={recipe.url.startsWith('http') ? recipe.url : 'https://' + recipe.url}
              target="_blank" rel="noopener noreferrer" className="recipe-link-btn">
              <ExternalLink size={14} />
            </a>
          )}
          <ActionMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      {recipe.note && <p className="recipe-note">{recipe.note}</p>}
    </motion.div>
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
    setRecipes(prev => [...prev, { ...recipe, id: Date.now(), favourite: false }]);
    setShowForm(false);
  };

  const handleToggleFavorite = (id) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, favourite: !r.favourite } : r));
  };

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Recipes</h2>
          <p className="tab-page-sub">{recipes.length} saved</p>
        </div>
        <button className="fab-sm" onClick={() => setShowForm(true)}><Plus size={18} /></button>
      </div>

      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search recipes..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <button className={`fav-toggle-pill ${showFavoritesOnly ? 'active' : ''}`} 
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}>
          <Star size={13} fill={showFavoritesOnly ? "currentColor" : "none"} /> 
          <span>Favorites</span>
        </button>
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
            {displayRecipes.map(r => (
              <RecipeCard key={r.id} recipe={r} 
                onEdit={() => setEditingRecipe(r)}
                onDelete={() => setDeletingId(r.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
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

// ─── Shopping Tab ─────────────────────────────────────────────────────────────

function ShoppingTab({ shoppingList, setShoppingList }) {
  const [newItem, setNewItem] = useState('');
  const inputRef = useRef(null);

  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    setShoppingList(prev => [...prev, { id: Date.now(), text: titleCase(t), done: false }]);
    setNewItem('');
    inputRef.current?.focus();
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
          <p className="tab-page-sub">{pending > 0 ? `${pending} item${pending > 1 ? 's' : ''} remaining` : done > 0 ? 'All done! 🎉' : 'List is empty'}</p>
        </div>
        {done > 0 && (
          <button className="btn-ghost-sm" onClick={clearDone}><Trash2 size={13} /> Clear done</button>
        )}
      </div>

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
                className={`shopping-item ${item.done ? 'done' : ''}`}>
                <button className={`check-circle ${item.done ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                  {item.done && <Check size={11} />}
                </button>
                <span className="item-text">{item.text}</span>
                <button className="delete-item-btn" onClick={() => del(item.id)}><X size={13} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

// ─── Next Bites Tab ───────────────────────────────────────────────────────────
function AddNextBiteForm({ onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [locationUrl, setLocationUrl] = useState(initialData?.locationUrl || '');
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
      dishes: cleanedDishes.join(', '),
      completed: initialData?.completed || false,
    });
    if (!initialData) { setName(''); setLocation(''); setLocationUrl(''); setDishes(['']); }
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

function NextBiteCard({ bite, onEdit, onDelete, onToggleComplete }) {
  const dishList = bite.dishes ? bite.dishes.split(', ') : [];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className={`next-bite-card ${bite.completed ? 'completed' : ''}`}>
      <div className="bite-card-header">
        <div className="bite-card-title-group">
          <h4 className="bite-card-name" style={{ textDecoration: bite.completed ? 'line-through' : 'none' }}>{bite.name}</h4>
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
          <ActionMenu onEdit={onEdit} onDelete={onDelete} />
          <button className={`bite-complete-toggle ${bite.completed ? 'active' : ''}`} onClick={() => onToggleComplete(bite.id)}>
            {bite.completed ? <Check size={14} /> : <div className="bite-dot" />}
          </button>
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
    </motion.div>
  );
}

function NextBitesTab({ bites, setBites }) {
  const [showForm, setShowForm] = useState(false);
  const [editingBite, setEditingBite] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = bites.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.location?.toLowerCase().includes(search.toLowerCase()) ||
    b.dishes?.toLowerCase().includes(search.toLowerCase())
  );
  const activeBites = filtered.filter(b => !b.completed);
  const completedBites = filtered.filter(b => b.completed);

  const handleAdd = (data) => {
    setBites(prev => [...prev, { ...data, id: Date.now() }]);
    setShowForm(false);
  };

  const handleToggle = (id) => {
    setBites(prev => prev.map(b => b.id === id ? { ...b, completed: !b.completed } : b));
  };

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">Next Bites</h2>
          <p className="tab-page-sub">{activeBites.length} places to explore</p>
        </div>
        <button className="fab-sm" style={{ background: 'var(--primary)' }} onClick={() => setShowForm(true)}><Plus size={18} /></button>
      </div>

      <div className="search-bar">
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bites-list">
        {activeBites.length === 0 && completedBites.length === 0 ? (
          <div className="empty-state">
            <Star size={36} className="empty-icon" />
            <p>Your wishlist is empty</p>
            <span>Tap + to add restaurants you want to visit</span>
          </div>
        ) : (
          <>
            <div className="active-bites-section">
              {activeBites.map(b => (
                <NextBiteCard key={b.id} bite={b} onEdit={() => setEditingBite(b)}
                  onDelete={() => setDeletingId(b.id)} onToggleComplete={handleToggle} />
              ))}
            </div>

            {completedBites.length > 0 && (
              <div className="completed-bites-section">
                <button className="past-expand-btn" onClick={() => setCompletedExpanded(!completedExpanded)}>
                  <span>Visited Restaurants ({completedBites.length})</span>
                  <ChevronRight size={14} style={{ transform: completedExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                <AnimatePresence>
                  {completedExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div className="bites-list-inner" style={{ marginTop: 12 }}>
                        {completedBites.map(b => (
                          <NextBiteCard key={b.id} bite={b} onEdit={() => setEditingBite(b)}
                            onDelete={() => setDeletingId(b.id)} onToggleComplete={handleToggle} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
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
  { id: 'nextbites', label: 'Next Bites', Icon: Star },
  { id: 'recipes', label: 'Recipes', Icon: BookOpen },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCart },
];

function MenuPicker({ isOpen, onClose, menuItems, onSelect }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(menuItems.map(m => m.category))];

  const filtered = menuItems.filter(item => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dishes">
      <div className="search-bar" style={{ marginBottom: 12 }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search saved dishes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="category-pills" style={{ marginBottom: 16 }}>
        {categories.map(cat => (
          <button key={cat} className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
            style={activeCategory === cat && cat !== 'All' ? { '--pill-color': catColor(cat) } : {}}
            onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {menuItems.length === 0 ? (
        <div className="empty-state">
          <UtensilsCrossed size={36} className="empty-icon" />
          <p>Menu is empty</p>
          <span>Add some dishes in the Menu tab first</span>
        </div>
      ) : filtered.length === 0 ? (
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

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(transparent, var(--bg-card))', pointerEvents: 'none' }}>
            <button className="primary-btn" onClick={onClose} style={{ pointerEvents: 'auto', width: '100%', borderRadius: 16 }}>
              Done <Check size={18} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('planner');
  const [plan, setPlan] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [nextBites, setNextBites] = useState([]);
  const [pickerSlot, setPickerSlot] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('pb-theme') || 'light');

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pb-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // 1. Auth Listener
  useEffect(() => {
    console.log("Firebase Auth: Initializing...");
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        console.log("Firebase Auth: Signed in as", u.uid);
        setUser(u);
      } else {
        console.warn("Firebase Auth: No user signed in");
        setLoading(false);
      }
    });
  }, []);

  // 2. Initial Data Load & Migration (Refactored for solid multi-device sync)
  useEffect(() => {
    if (!user) return;
    const SHARED_ID = 'shared-kitchen-v1';
    const userDocRef = doc(db, 'users', SHARED_ID);

    let unsub = null;

    const initializeData = async () => {
      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          console.log("Firestore: First initialization...");
          await setDoc(userDocRef, {
            plan: load('mp-plan', {}),
            menu: load('mp-menu', []),
            recipes: load('mp-recipes', []),
            shopping: load('mp-shopping', []),
            nextbites: load('mp-nextbites', []),
          });
        }

        // Start live listener AFTER Ensuring the doc exists
        unsub = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlan(data.plan || {});
            setMenuItems(data.menu || []);
            setRecipes(data.recipes || []);
            setShoppingList(data.shopping || []);
            setNextBites(data.nextbites || []);
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore: Sync Error:", err.message);
          setLoading(false);
        });
      } catch (err) {
        console.error("Firestore: Init Error:", err.message);
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
    const SHARED_ID = 'shared-kitchen-v1';
    try {
      await setDoc(doc(db, 'users', SHARED_ID), { [field]: value }, { merge: true });
    } catch (err) {
      console.error(`Firestore: Update failed for ${field}:`, err.message);
    }
  };

  const handlePlanChange = (val) => {
    const newVal = typeof val === 'function' ? val(plan) : val;
    setPlan(newVal); updateFirebase('plan', newVal);
  };
  const handleMenuChange = (val) => {
    const newVal = typeof val === 'function' ? val(menuItems) : val;
    setMenuItems(newVal); updateFirebase('menu', newVal);
  };
  const handleRecipesChange = (val) => {
    const newVal = typeof val === 'function' ? val(recipes) : val;
    setRecipes(newVal); updateFirebase('recipes', newVal);
  };
  const handleShoppingChange = (val) => {
    const newVal = typeof val === 'function' ? val(shoppingList) : val;
    setShoppingList(newVal); updateFirebase('shopping', newVal);
  };
  const handleNextBitesChange = (val) => {
    const newVal = typeof val === 'function' ? val(nextBites) : val;
    setNextBites(newVal); updateFirebase('nextbites', newVal);
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
    // Don't close picker here, user might add more
  };

  return (
    <div className="app-shell">
      {loading && <LoadingOverlay />}

      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo-container">
            <img src="/plan-bit-icon.jpg" alt="PlanBite Logo" className="header-logo-img" />
          </div>
          <div>
            <h1 className="header-title">PlanBite</h1>
            <div className="header-subtitle-row">
              <p className="header-subtitle">Elegant kitchen companion</p>
              <div className="sync-badge" title="Live Sync Active">
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
          <div className="header-sparkle" title="PlanBite Sparkle">
            <Sparkles size={18} />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div key={tab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: 'easeOut' }}
              className="tab-content">
              {tab === 'planner' && <PlannerTab plan={plan} onPlanChange={handlePlanChange} menuItems={menuItems} onOpenPicker={setPickerSlot} />}
              {tab === 'menu' && <MenuTab menuItems={menuItems} setMenuItems={handleMenuChange} />}
              {tab === 'recipes' && <RecipesTab recipes={recipes} setRecipes={handleRecipesChange} />}
              {tab === 'shopping' && <ShoppingTab shoppingList={shoppingList} setShoppingList={handleShoppingChange} />}
              {tab === 'nextbites' && <NextBitesTab bites={nextBites} setBites={handleNextBitesChange} />}
            </motion.div>
          )}
        </AnimatePresence>

        <MenuPicker
          isOpen={!!pickerSlot}
          onClose={() => setPickerSlot(null)}
          menuItems={menuItems}
          onSelect={handlePickerSelect}
        />
      </main>

      {/* Bottom Nav */}
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
    </div>
  );
}
