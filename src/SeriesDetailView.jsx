function SeriesDetailView({ series, onUpdate, onBack }) {
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  const seasons = series.seasons || [];
  const activeSeason = seasons.find(s => s.id === activeSeasonId);

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
    
    const startNum = season.episodes.length + 1;
    const newEpisodes = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      number: startNum + i,
      watched: false
    }));
    
    const updatedSeasons = seasons.map(s => 
      s.id === seasonId ? { ...s, episodes: [...s.episodes, ...newEpisodes] } : s
    );
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  const toggleEpisode = (seasonId, epId) => {
    const updatedSeasons = seasons.map(s => {
      if (s.id === seasonId) {
        const updatedEpisodes = s.episodes.map(e => 
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
        const updatedEpisodes = s.episodes.map(e => ({ ...e, watched }));
        return { ...s, episodes: updatedEpisodes };
      }
      return s;
    });
    onUpdate({ ...series, seasons: updatedSeasons });
  };

  if (activeSeason) {
    return (
      <div className="series-detail-view">
        <div className="tab-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="back-circle-btn" onClick={() => setActiveSeasonId(null)}>
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="tab-page-title">Season {activeSeason.number.toString().padStart(2, '0')}</h2>
              <p className="tab-page-sub">{series.title}</p>
            </div>
          </div>
          <button className="fab-sm" onClick={() => {
            const count = parseInt(prompt('How many episodes to add?', '1'));
            if (count > 0) addEpisodes(activeSeason.id, count);
          }}>
            <Plus size={18} />
          </button>
        </div>

        <div className="episode-list">
          {activeSeason.episodes.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 60 }}>
              <Tv size={48} className="empty-icon" />
              <p>No episodes added yet</p>
              <button className="primary-btn" onClick={() => {
                const count = parseInt(prompt('How many episodes to add?', '10'));
                if (count > 0) addEpisodes(activeSeason.id, count);
              }} style={{ marginTop: 20 }}>Add Episodes</button>
            </div>
          ) : (
            activeSeason.episodes.map(ep => (
              <div key={ep.id} className="episode-row" onClick={() => toggleEpisode(activeSeason.id, ep.id)}>
                <div className="episode-info">
                  <span className="episode-num">E{ep.number.toString().padStart(2, '0')}</span>
                  <span className="episode-status">{ep.watched ? 'Watched' : 'Unwatched'}</span>
                </div>
                <div className={`episode-checkbox ${ep.watched ? 'checked' : ''}`}>
                  {ep.watched && <Check size={14} />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="series-detail-view">
      <div className="tab-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-circle-btn" onClick={onBack}>
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="tab-page-title">{series.title}</h2>
            <p className="tab-page-sub">{seasons.length} Seasons</p>
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
            const watchedCount = s.episodes.filter(e => e.watched).length;
            const totalCount = s.episodes.length;
            const isFullyWatched = totalCount > 0 && watchedCount === totalCount;
            
            return (
              <div key={s.id} className="season-card" onClick={() => setActiveSeasonId(s.id)}>
                <div className="season-info">
                  <span className="season-num">S{s.number.toString().padStart(2, '0')}</span>
                  <span className="season-progress">{watchedCount}/{totalCount} Episodes</span>
                </div>
                <button 
                  className={`season-toggle ${isFullyWatched ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSeason(s.id, !isFullyWatched);
                  }}
                >
                  <Check size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
