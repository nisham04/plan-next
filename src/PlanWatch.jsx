
function MovieCard({ movie, onEdit, onDelete, onToggleFavorite, onToggleComplete, dragControls }) {
  const controls = useDragControls();
  const startDrag = (e) => dragControls ? dragControls.start(e) : controls.start(e);

  return (
    <div className={`next-bite-card ${movie.completed ? 'completed' : ''}`}>
      <div className="drag-handle-inline" onPointerDown={startDrag}>
        <GripVertical size={16} />
      </div>
      <div className="card-main-content">
        <div className="recipe-card-top">
          <div className="recipe-domain">
            <Film size={12} style={{ marginRight: 4 }} />
            {movie.year || 'No Year'}
          </div>
          <div className="card-actions-row">
            <button className={`recipe-favorite-btn ${movie.favorite ? 'active' : ''}`} onClick={onToggleFavorite}>
              <Star size={14} fill={movie.favorite ? "currentColor" : "none"} />
            </button>
            <ActionMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
        <div className="recipe-name" style={{ marginTop: 4, marginBottom: 8 }}>{movie.title}</div>
        <div className="recipe-note" style={{ fontStyle: 'italic', opacity: 0.7 }}>{movie.note || 'No notes added'}</div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="bite-complete-toggle" onClick={onDelete}>
            <Check size={14} /> <span>Mark as Watched</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SeriesCard({ series, onEdit, onDelete, onToggleFavorite, onToggleComplete, dragControls }) {
  const controls = useDragControls();
  const startDrag = (e) => dragControls ? dragControls.start(e) : controls.start(e);

  return (
    <div className={`next-bite-card ${series.completed ? 'completed' : ''}`}>
      <div className="drag-handle-inline" onPointerDown={startDrag}>
        <GripVertical size={16} />
      </div>
      <div className="card-main-content">
        <div className="recipe-card-top">
          <div className="recipe-domain" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Tv size={12} style={{ marginRight: 4 }} />
            <span>{series.seasons || '1'} Seasons</span>
            {series.status === 'ongoing' && (
              <span className="watch-tag" style={{ background: '#000000', color: '#ffd700', border: '1px solid #ffd700', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase' }}>Ongoing</span>
            )}
          </div>
          <div className="card-actions-row">
            <button className={`recipe-favorite-btn ${series.favorite ? 'active' : ''}`} onClick={onToggleFavorite}>
              <Star size={14} fill={series.favorite ? "currentColor" : "none"} />
            </button>
            <ActionMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
        <div className="recipe-name" style={{ marginTop: 4, marginBottom: 8 }}>{series.title}</div>
        <div className="recipe-note" style={{ fontStyle: 'italic', opacity: 0.7 }}>{series.note || 'No notes added'}</div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button className={`bite-complete-toggle ${series.completed ? 'active' : ''}`} onClick={onToggleComplete}>
            <Check size={14} /> <span>{series.completed ? 'Watched' : 'Mark as Watched'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AddWatchItemForm({ onSubmit, initialData, type }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [extra, setExtra] = useState(type === 'movies' ? (initialData?.year || '') : (initialData?.seasons || ''));
  const [note, setNote] = useState(initialData?.note || '');
  const [status, setStatus] = useState(initialData?.status || 'completed');

  return (
    <form className="add-recipe-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({
        title,
        note,
        status,
        [type === 'movies' ? 'year' : 'seasons']: extra,
        updatedAt: Date.now()
      });
    }}>
      <div className="auth-input-group">
        <label>{type === 'movies' ? 'Movie Title' : 'Series Title'}</label>
        <input className="meal-slot-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Inception" required />
      </div>
      <div className="auth-input-group">
        <label>{type === 'movies' ? 'Release Year' : 'Number of Seasons'}</label>
        <input className="meal-slot-input" value={extra} onChange={e => setExtra(e.target.value)} placeholder={type === 'movies' ? "e.g. 2010" : "e.g. 5"} />
      </div>
      <div className="auth-input-group">
        <label>Personal Note / Thoughts</label>
        <textarea className="meal-slot-input" style={{ height: 80, padding: 12 }} value={note} onChange={e => setNote(e.target.value)} placeholder="What did you think of it?" />
      </div>
      {type === 'series' && initialData && (
        <div className="auth-input-group" style={{ marginBottom: 25 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>Series Status</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className={`sort-pill ${status === 'ongoing' ? 'active' : ''}`}
              onClick={() => setStatus('ongoing')}
              style={{ flex: 1, padding: '12px', justifyContent: 'center', margin: 0 }}
            >
              Ongoing
            </button>
            <button
              type="button"
              className={`sort-pill ${status === 'completed' ? 'active' : ''}`}
              onClick={() => setStatus('completed')}
              style={{ flex: 1, padding: '12px', justifyContent: 'center', margin: 0 }}
            >
              Completed
            </button>
          </div>
        </div>
      )}
      <button type="submit" className="auth-btn">
        {initialData ? 'Update Item' : 'Add to List'}
      </button>
    </form>
  );
}

function PlanWatchTab({ type, items, setItems }) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('to-watch');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterOngoing, setFilterOngoing] = useState(false);

  const handleAdd = (data) => {
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
  const handleReorder = (newOrder) => {
    // Merge new order back into full list
    const otherType = items.filter(i => view === 'to-watch' ? i.completed : !i.completed);
    setItems([...newOrder, ...otherType]);
  };

  const filtered = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase());
    const matchesOngoing = !filterOngoing || (
      type === 'series' && i.status === 'ongoing'
    );
    if (type === 'movies') return matchesSearch; // No 'watched' state for movies, they just get deleted
    const matchesView = view === 'to-watch' ? !i.completed : i.completed;
    return matchesSearch && matchesView && matchesOngoing;
  });

  const favorites = items.filter(i => i.favorite);

  return (
    <div className="tab-page">
      <div className="tab-page-header">
        <div>
          <h2 className="tab-page-title">{type === 'movies' ? 'Movies' : 'Series'}</h2>
          <p className="tab-page-sub">
            {filtered.length} {type} {type === 'series' ? (view === 'to-watch' ? 'to watch' : 'watched') : ''}
          </p>
        </div>
        <div className="tab-header-actions">
          <button className="btn-primary-sm" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add {type === 'movies' ? 'Movie' : 'Series'}
          </button>
        </div>
      </div>

      <div className="search-bar">
        <Search size={16} className="search-icon" />
        <input className="search-input" placeholder={`Search ${type}...`} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {type === 'series' && (
        <div className="next-bites-sub-nav">
          <button className={`sub-nav-btn ${view === 'to-watch' ? 'active' : ''}`} onClick={() => setView('to-watch')}>
            To Watch ({items.filter(i => !i.completed).length})
          </button>
          <button className={`sub-nav-btn ${view === 'watched' ? 'active' : ''}`} onClick={() => setView('watched')}>
            Watched ({items.filter(i => i.completed).length})
          </button>
        </div>
      )}

      {type === 'series' && (
        <div className="sort-pills-container" style={{ display: 'flex', gap: 10, marginBottom: 20, padding: '0 4px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <button
            className={`sort-pill ${filterOngoing ? 'active' : ''}`}
            onClick={() => setFilterOngoing(!filterOngoing)}
            style={{
              padding: '6px 14px',
              background: filterOngoing ? 'var(--primary)' : 'var(--bg-card2)',
              color: filterOngoing ? '#000' : 'var(--text-3)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>Ongoing</span>
          </button>
        </div>
      )}

      <div className="bites-list">
        {filtered.length === 0 ? (
          <div className="empty-state">
            {type === 'movies' ? <Film size={36} className="empty-icon" /> : <Tv size={36} className="empty-icon" />}
            <p>Your {type} list is empty</p>
            <span>Start by adding something you want to watch</span>
          </div>
        ) : (
          <Reorder.Group axis="y" values={filtered} onReorder={handleReorder} className="bites-list">
            {filtered.map(item => (
              <Reorder.Item key={item.id} value={item} transition={{ type: 'spring', duration: 0.4 }}>
                {type === 'movies' ? (
                  <MovieCard movie={item} onEdit={() => setEditingItem(item)} onDelete={() => setDeletingId(item.id)}
                    onToggleFavorite={() => handleToggleFavorite(item.id)} onToggleComplete={() => handleToggle(item.id)} />
                ) : (
                  <SeriesCard series={item} onEdit={() => setEditingItem(item)} onDelete={() => setDeletingId(item.id)}
                    onToggleFavorite={() => handleToggleFavorite(item.id)} onToggleComplete={() => handleToggle(item.id)} />
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
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
        title={`Delete ${type === 'movies' ? 'Movie' : 'Series'}?`}
        message={`Are you sure you want to remove this from your list?`}
      />
    </div>
  );
}
