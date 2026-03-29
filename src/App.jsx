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
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const MEAL_ICONS = { Breakfast: Coffee, Lunch: Sun, Dinner: Moon };
const MEAL_COLORS = {
  Breakfast: { bg: 'rgba(166,139,54,0.06)', border: 'rgba(166,139,54,0.15)', text: '#a68b36', glow: 'rgba(166,139,54,0.05)' }, // Muted Gold
  Lunch: { bg: 'rgba(110,120,110,0.06)', border: 'rgba(110,120,110,0.15)', text: '#6e786e', glow: 'rgba(110,120,110,0.05)' }, // Sage
  Dinner: { bg: 'rgba(120,100,90,0.06)', border: 'rgba(120,100,90,0.15)', text: '#78645a', glow: 'rgba(120,100,90,0.05)' }, // Earth
};

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

function getFaviconUrl(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch { return null; }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? def; } catch { return def; } };
const save = () => {}; // No-op, we'll use Firestore setters

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
              background: 'rgba(6,9,16,0.80)',
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
  const [draft, setDraft] = useState(value);
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);
  const colors = MEAL_COLORS[meal];
  const Icon = MEAL_ICONS[meal];

  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => { onChange(draft.trim()); setEditing(false); setShowPicker(false); };
  const handleKey = (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } };
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const dishes = value ? value.split(',').map(d => d.trim()).filter(Boolean) : [];

  const addDish = (name) => {
    const newDishes = [...dishes, name];
    onChange(newDishes.join(', '));
  };

  const removeDish = (index) => {
    const newDishes = dishes.filter((_, i) => i !== index);
    onChange(newDishes.join(', '));
  };

  // Suggest from menu items
  const suggestions = draft.length >= 1
    ? menuItems.filter(m => m.name.toLowerCase().includes(draft.toLowerCase())).slice(0, 4)
    : [];

  return (
    <div className="meal-slot" style={{ '--slot-bg': colors.bg, '--slot-border': colors.border, '--slot-text': colors.text }}>
      <div className="meal-slot-label"><Icon size={11} style={{ color: colors.text }} /><span>{meal}</span></div>
      {editing ? (
        <div className="meal-slot-input-wrap">
          <div className="meal-slot-input-row">
            <input ref={inputRef} className="meal-slot-input" value={draft}
              onChange={e => setDraft(e.target.value)} onKeyDown={handleKey} onBlur={() => setTimeout(commit, 150)}
              placeholder={`Add meal for ${meal.toLowerCase()}...`} maxLength={60} />
            <button className="slot-action-btn confirm" onMouseDown={commit}><Check size={14} /></button>
            <button className="slot-action-btn confirm" onMouseDown={(e) => { e.preventDefault(); onOpenPicker(); }} title="Select from saved menu">
              <UtensilsCrossed size={14} />
            </button>
          </div>
          {suggestions.length > 0 && (
            <div className="meal-suggestions">
              {suggestions.map(s => (
                <button key={s.id} className="meal-suggestion-item" onMouseDown={() => { addDish(s.name); setDraft(''); setEditing(false); }}>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="meal-slot-display-container">
          <button className={`meal-slot-display ${dishes.length > 0 ? 'filled' : 'empty'}`} onClick={() => setEditing(true)}>
            {dishes.length > 0 ? (
              <div className="meal-chips">
                {dishes.map((d, i) => (
                  <span key={i} className="meal-chip">
                    {d}
                    <X size={10} className="chip-del" onMouseDown={e => { e.stopPropagation(); removeDish(i); }} />
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

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

function AddMenuItemForm({ onSubmit, existingCategories }) {
  const allCats = [...new Set([...DEFAULT_MENU_CATEGORIES, ...existingCategories])];
  const [name, setName] = useState('');
  const [category, setCategory] = useState(allCats[0]);
  const [customCat, setCustomCat] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cat = useCustom ? customCat.trim() : category;
    if (!name.trim() || !cat) return;
    onSubmit({ name: name.trim(), category: cat });
    setName('');
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <FormField label="Dish Name">
        <input className="form-input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Masala Oats" maxLength={60} required />
      </FormField>
      <FormField label="Category">
        {useCustom ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={customCat} onChange={e => setCustomCat(e.target.value)}
              placeholder="New category name" style={{ flex: 1 }} />
            <button type="button" className="btn-ghost" onClick={() => setUseCustom(false)}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1 }}>
              {allCats.map(c => <option key={c}>{c}</option>)}
            </select>
            <button type="button" className="btn-ghost" onClick={() => setUseCustom(true)}>+ New</button>
          </div>
        )}
      </FormField>
      <button type="submit" className="btn-primary" disabled={!name.trim()}>Add to Menu</button>
    </form>
  );
}

function MenuTab({ menuItems, setMenuItems }) {
  const [showForm, setShowForm] = useState(false);
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
                    <div className="menu-item-cat-dot" style={{ background: catColor(item.category) }} />
                    <span className="menu-item-name">{item.name}</span>
                    <button className="menu-item-delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={13} />
                    </button>
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
    </div>
  );
}

// ─── Recipes Tab ──────────────────────────────────────────────────────────────

function AddRecipeForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), url: url.trim(), note: note.trim() });
    setName(''); setUrl(''); setNote('');
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

function RecipeCard({ recipe, onDelete }) {
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
          {recipe.url && (
            <a href={recipe.url.startsWith('http') ? recipe.url : 'https://' + recipe.url}
              target="_blank" rel="noopener noreferrer" className="recipe-link-btn">
              <ExternalLink size={14} />
            </a>
          )}
          <button className="recipe-delete-btn" onClick={() => onDelete(recipe.id)}><Trash2 size={13} /></button>
        </div>
      </div>
      {recipe.note && <p className="recipe-note">{recipe.note}</p>}
    </motion.div>
  );
}

function RecipesTab({ recipes, setRecipes }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = (recipe) => {
    setRecipes(prev => [...prev, { ...recipe, id: Date.now() }]);
    setShowForm(false);
  };

  const handleDelete = (id) => setRecipes(prev => prev.filter(r => r.id !== id));

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
      </div>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} className="empty-icon" />
          <p>No recipes saved</p>
          <span>Tap + to save your first recipe link</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No results found</p></div>
      ) : (
        <div className="recipes-list">
          <AnimatePresence>
            {filtered.map(r => <RecipeCard key={r.id} recipe={r} onDelete={handleDelete} />)}
          </AnimatePresence>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Save Recipe">
        <AddRecipeForm onSubmit={handleAdd} />
      </Modal>
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
    setShoppingList(prev => [...prev, { id: Date.now(), text: t, done: false }]);
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

const TABS = [
  { id: 'planner', label: 'Planner', Icon: CalendarDays },
  { id: 'menu', label: 'Menu', Icon: UtensilsCrossed },
  { id: 'recipes', label: 'Recipes', Icon: BookOpen },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCart },
];

function MenuPicker({ isOpen, onClose, menuItems, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = menuItems.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Dishes">
      <div className="search-bar" style={{ marginBottom: 16 }}>
        <Search size={15} className="search-icon" />
        <input className="search-input" placeholder="Search saved dishes..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {menuItems.length === 0 ? (
        <div className="empty-state">
          <UtensilsCrossed size={36} className="empty-icon" />
          <p>Menu is empty</p>
          <span>Add some dishes in the Menu tab first</span>
        </div>
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
  const [pickerSlot, setPickerSlot] = useState(null);

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

  // 2. Initial Data Load & Migration
  useEffect(() => {
    if (!user) return;

    console.log("Firestore: Fetching user document...", user.uid);
    const userDocRef = doc(db, 'users', user.uid);

    const migrate = async () => {
      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          console.log("Firestore: No existing data. Migrating from LocalStorage...");
          const localData = {
            plan: load('mp-plan', {}),
            menu: load('mp-menu', []),
            recipes: load('mp-recipes', []),
            shopping: load('mp-shopping', []),
          };
          await setDoc(userDocRef, localData);
          console.log("Firestore: Migration complete.");
        } else {
          console.log("Firestore: Data found for user.");
        }
      } catch (err) {
        console.error("Firestore: Migration/Load Error:", err.message);
        alert("Firestore Sync Error: " + err.message);
      }
    };

    migrate().then(() => {
      // 3. Real-time Subscription
      console.log("Firestore: Subscribing to updates...");
      const unsub = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setPlan(data.plan || {});
          setMenuItems(data.menu || []);
          setRecipes(data.recipes || []);
          setShoppingList(data.shopping || []);
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore: Snapshot Error:", err.message);
        setLoading(false);
      });
      return unsub;
    });
  }, [user]);

  // Firestore update helpers
  const updateFirebase = async (field, value) => {
    if (!user) {
      console.error("Firestore: Cannot save, user not signed in.");
      return;
    }
    console.log(`Firestore: Updating ${field}...`);
    try {
      await setDoc(doc(db, 'users', user.uid), { [field]: value }, { merge: true });
      console.log(`Firestore: Successfully updated ${field}.`);
    } catch (err) {
      console.error(`Firestore: Error updating ${field}:`, err.message);
      if (err.message.includes('permission-denied')) {
        alert("Firebase Permission Denied! Please check your Firestore rules (ensure 'test mode' rules allow writes).");
      }
    }
  };

  const handlePlanChange = (val) => { setPlan(val); updateFirebase('plan', val); };
  const handleMenuChange = (val) => { setMenuItems(val); updateFirebase('menu', val); };
  const handleRecipesChange = (val) => { setRecipes(val); updateFirebase('recipes', val); };
  const handleShoppingChange = (val) => { setShoppingList(val); updateFirebase('shopping', val); };

  const handlePickerSelect = (name) => {
    if (!pickerSlot) return;
    const { weekKey, day, meal } = pickerSlot;
    const weekData = plan[weekKey] || emptyWeek();
    const currentVal = weekData[day]?.[meal] || '';
    const dishes = currentVal ? currentVal.split(',').map(d => d.trim()).filter(Boolean) : [];

    if (dishes.includes(name)) return; // Don't duplicate

    const newVal = [...dishes, name].join(', ');

    setPlan({
      ...plan,
      [weekKey]: {
        ...weekData,
        [day]: { ...weekData[day], [meal]: newVal }
      }
    });

    // Don't close picker here, user might add more
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo-container">
            <img src="/plan-bit-icon.jpg" alt="PlanBite Logo" className="header-logo-img" />
          </div>
          <div>
            <h1 className="header-title">PlanBite</h1>
            <p className="header-subtitle">Your elegant kitchen companion</p>
          </div>
        </div>
        <div className="header-sparkle"><Sparkles size={18} /></div>
      </header>

      {/* Content */}
      <main className="app-main">
        {loading && <LoadingOverlay />}
        
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
