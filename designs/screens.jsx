// screens.jsx — Now, Browse, Favourites, Station Detail
const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS, useRef: useRefS } = React;

// ─── Now screen ───────────────────────────────────────────────
function NowScreen({ state, setState, theme }) {
  const dark = theme.dark;
  const station = STATION_BY_ID[state.currentStation];
  const [now, setNow] = useStateS(state.simulatedNow || Date.now());
  useEffectS(() => {
    const t = setInterval(() => setNow(Date.now() + (state.timeOffset || 0)), 30000);
    return () => clearInterval(t);
  }, [state.timeOffset]);

  const departures = useMemoS(() => generateDepartures(station, now, 8), [station.id, Math.floor(now / 60000)]);
  const pinned = state.favourites.includes(station.id);

  const greet = (() => {
    const h = new Date(now).getHours();
    if (h < 5) return 'Late night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  })();

  const updated = new Date(now);
  const hh = String(updated.getHours()).padStart(2, '0');
  const mm = String(updated.getMinutes()).padStart(2, '0');

  return (
    <div style={{ padding: '8px 0 120px' }}>
      {/* header strip */}
      <div style={{ padding: '14px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)',
          padding: '6px 10px',
          ...glass(dark, { rad: 999, blur: 20, opacity: dark ? 0.35 : 0.45 }),
        }}>
          <Icon.Loc width="13" height="13" /> Near you
        </div>
        <button
          onClick={() => setState({ ...state, sheet: 'switch-station' })}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: dark ? '#fff' : '#0a0a0a',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 4px',
          }}
        >Change <Icon.Chevron width="14" height="14" /></button>
      </div>

      {/* greeting + station */}
      <div style={{ padding: '8px 20px 24px' }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
          marginBottom: 4,
        }}>{greet}.</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 44, lineHeight: 0.98, letterSpacing: '-0.035em',
          margin: 0, color: dark ? '#fff' : '#0a0a0a',
          textWrap: 'balance',
        }}>{station.name}</h1>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', flex: 'none' }}><LineStrip ids={station.lines} size={10} gap={5} /></span>
          <span style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
            {station.lines.length} lines · Zone {station.zone}
          </span>
          <PinButton pinned={pinned} onClick={() => toggleFavourite(state, setState, station.id)} dark={dark} />
        </div>
      </div>

      {/* departures card */}
      <div style={{
        margin: '0 16px', overflow: 'hidden',
        ...glass(dark, { rad: 24 }),
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 18px 6px',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
          }}>Next departures</div>
          <div style={{
            fontSize: 11, fontFamily: 'var(--font-mono)',
            color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: 999, background: '#22A06B',
              boxShadow: '0 0 0 3px #22A06B33',
            }} /> live · {hh}:{mm}
          </div>
        </div>
        <div style={{ padding: '4px 0 8px 16px' }}>
          {departures.slice(0, theme.dense ? 6 : 5).map((d, i) => (
            <React.Fragment key={i}>
              <DepartureRow dep={d} dark={dark} format={theme.timeFormat} compact={theme.dense} />
              {i < (theme.dense ? 5 : 4) && (
                <div style={{
                  height: 1, marginLeft: 18,
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={() => setState({ ...state, screen: 'station', detailId: station.id })}
          style={{
            width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
            padding: '14px 18px',
            borderTop: `0.5px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 14, fontWeight: 500, color: dark ? '#fff' : '#0a0a0a',
          }}>
          All departures
          <Icon.Chevron width="16" height="16" />
        </button>
      </div>

      {/* quick favourites */}
      {state.favourites.filter(id => id !== station.id).length > 0 && (
        <div style={{ marginTop: 28 }}>
          <SectionLabel dark={dark}>Pinned</SectionLabel>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 6px',
            scrollbarWidth: 'none',
          }}>
            {state.favourites.filter(id => id !== station.id).map(id => {
              const s = STATION_BY_ID[id];
              const next = generateDepartures(s, now, 1)[0];
              return (
                <button
                  key={id}
                  onClick={() => setState({ ...state, currentStation: id })}
                  style={{
                    flex: '0 0 auto', textAlign: 'left', cursor: 'pointer',
                    minWidth: 170, padding: '14px 14px 12px',
                    ...glass(dark, { rad: 18, blur: 28 }),
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <LineStrip ids={s.lines.slice(0, 4)} size={7} gap={3} />
                    <Icon.Star width="13" height="13" style={{ color: '#E55934' }} />
                  </div>
                  <div style={{
                    fontSize: 16, fontWeight: 500, marginTop: 8, letterSpacing: '-0.01em',
                    color: dark ? '#fff' : '#0a0a0a',
                  }}>{s.name}</div>
                  <div style={{
                    marginTop: 6, fontSize: 12,
                    color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                      → {next.destination}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: dark ? '#fff' : '#0a0a0a' }}>
                      {next.mins <= 1 ? 'Due' : `${next.mins} min`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* service status (visual filler with real info hooks) */}
      <div style={{ padding: '28px 20px 0' }}>
        <SectionLabel dark={dark} style={{ paddingLeft: 0 }}>Service</SectionLabel>
        <div style={{
          marginTop: 4, padding: '14px 16px',
          display: 'flex', gap: 12, alignItems: 'center',
          ...glass(dark, { rad: 16, blur: 28 }),
          background: dark ? 'rgba(34,160,107,0.18)' : 'rgba(34,160,107,0.14)',
          border: '0.5px solid rgba(34,160,107,0.3)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 999, background: '#22A06B',
            boxShadow: '0 0 0 4px rgba(34,160,107,0.22)',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: dark ? '#fff' : '#0a0a0a' }}>
              Good service on all lines
            </div>
            <div style={{ fontSize: 12, marginTop: 2, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)' }}>
              Updated 2 min ago
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Browse screen ────────────────────────────────────────────
function BrowseScreen({ state, setState, theme }) {
  const dark = theme.dark;
  const [query, setQuery] = useStateS('');
  const [filter, setFilter] = useStateS('ALL');
  const inputRef = useRefS(null);

  const filtered = useMemoS(() => {
    let xs = STATIONS;
    if (filter !== 'ALL') xs = xs.filter(s => s.lines.includes(filter));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      xs = xs.filter(s => s.name.toLowerCase().includes(q));
    }
    return xs.slice().sort((a,b) => a.name.localeCompare(b.name));
  }, [query, filter]);

  // group by first letter
  const groups = useMemoS(() => {
    const g = {};
    filtered.forEach(s => {
      const k = s.name[0].toUpperCase();
      (g[k] = g[k] || []).push(s);
    });
    return Object.entries(g);
  }, [filtered]);

  return (
    <div style={{ padding: '8px 0 120px' }}>
      <div style={{ padding: '8px 20px 12px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 34, letterSpacing: '-0.03em', margin: 0,
          color: dark ? '#fff' : '#0a0a0a',
        }}>Stations</h1>
      </div>

      {/* search input */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px',
          ...glass(dark, { rad: 14, blur: 24 }),
        }}>
          <Icon.Search width="18" height="18" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 99 stations"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, fontFamily: 'var(--font-sans)',
              color: dark ? '#fff' : '#0a0a0a',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              width: 22, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)',
              color: dark ? '#000' : '#fff',
              display: 'grid', placeItems: 'center',
            }}><Icon.X width="11" height="11" /></button>
          )}
        </div>
      </div>

      {/* line filter chips */}
      <div style={{
        display: 'flex', gap: 8, padding: '0 16px 8px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {[{id:'ALL',name:'All lines',color:'#888'}, ...Object.values(LINES)].map(L => {
          const active = filter === L.id;
          return (
            <button key={L.id} onClick={() => setFilter(L.id)} style={{
              flex: '0 0 auto', cursor: 'pointer',
              padding: '8px 12px 8px 10px', borderRadius: 999,
              whiteSpace: 'nowrap',
              border: `0.5px solid ${active ? L.color : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)')}`,
              background: active
                ? L.color + (dark ? '33' : '26')
                : (dark ? 'rgba(28,28,30,0.45)' : 'rgba(255,255,255,0.5)'),
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              color: dark ? '#fff' : '#0a0a0a',
              fontSize: 13, fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {L.id !== 'ALL' && <LineDot id={L.id} size={8} />}
              {L.name}
            </button>
          );
        })}
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '60px 30px', textAlign: 'center',
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>No stations match "{query}"</div>
          <div style={{ fontSize: 13 }}>Try another spelling, or clear the filter.</div>
        </div>
      ) : (
        groups.map(([letter, rows]) => (
          <div key={letter}>
            <div style={{
              padding: '14px 24px 6px', fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
              color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              position: 'sticky', top: 0, zIndex: 2,
              background: dark ? 'rgba(11,11,14,0.6)' : 'rgba(244,239,230,0.55)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}>{letter}</div>
            {rows.map(s => (
              <StationListRow
                key={s.id}
                station={s}
                pinned={state.favourites.includes(s.id)}
                onPin={() => toggleFavourite(state, setState, s.id)}
                onOpen={() => setState({ ...state, screen: 'station', detailId: s.id })}
                dark={dark}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function StationListRow({ station, pinned, onPin, onOpen, dark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 8px 4px 24px',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
    }}>
      <button onClick={onOpen} style={{
        flex: 1, textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
        padding: '10px 0', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
            color: dark ? '#fff' : '#0a0a0a',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{station.name}</div>
          <div style={{ fontSize: 12, marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>
            <span style={{ display: 'inline-flex', flex: 'none' }}><LineStrip ids={station.lines} size={7} gap={3} /></span>
            <span style={{ flex: 'none' }}>Zone {station.zone}</span>
          </div>
        </div>
      </button>
      <PinButton pinned={pinned} onClick={onPin} dark={dark} />
      <button onClick={onOpen} style={{
        border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
        color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
      }}><Icon.Chevron width="18" height="18" /></button>
    </div>
  );
}

// ─── Favourites screen ────────────────────────────────────────
function FavouritesScreen({ state, setState, theme }) {
  const dark = theme.dark;
  const [now, setNow] = useStateS(Date.now() + (state.timeOffset || 0));
  useEffectS(() => { const t = setInterval(() => setNow(Date.now() + (state.timeOffset || 0)), 30000); return () => clearInterval(t); }, [state.timeOffset]);

  const favs = state.favourites.map(id => STATION_BY_ID[id]).filter(Boolean);

  return (
    <div style={{ padding: '8px 0 120px' }}>
      <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 34, letterSpacing: '-0.03em', margin: 0,
          color: dark ? '#fff' : '#0a0a0a',
        }}>Pinned</h1>
        <span style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
          {favs.length} {favs.length === 1 ? 'station' : 'stations'}
        </span>
      </div>

      {favs.length === 0 ? (
        <div style={{ padding: '60px 30px', textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999, margin: '0 auto 16px',
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            display: 'grid', placeItems: 'center',
            color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
          }}>
            <Icon.StarO width="26" height="26" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, color: dark ? '#fff' : '#0a0a0a' }}>No pinned stations yet</div>
          <div style={{ fontSize: 14, marginTop: 6, color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)' }}>
            Pin a station to keep its next departures one tap away.
          </div>
          <button onClick={() => setState({ ...state, tab: 'browse' })} style={{
            marginTop: 18, padding: '11px 18px', borderRadius: 999, border: 'none',
            background: '#0a0a0a', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>Browse stations</button>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favs.map((s, idx) => {
            const ds = generateDepartures(s, now, 2);
            return (
              <div key={s.id} style={{
                overflow: 'hidden',
                ...glass(dark, { rad: 20 }),
              }}>
                <button
                  onClick={() => setState({ ...state, screen: 'station', detailId: s.id })}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer',
                    padding: '14px 16px 4px',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                      color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                      width: 18,
                    }}>{String(idx+1).padStart(2,'0')}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 19, fontWeight: 500, letterSpacing: '-0.015em',
                        color: dark ? '#fff' : '#0a0a0a',
                      }}>{s.name}</div>
                      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                        fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                        <span style={{ display: 'inline-flex', flex: 'none' }}><LineStrip ids={s.lines} size={7} gap={3} /></span>
                        <span style={{ flex: 'none' }}>Zone {s.zone}</span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavourite(state, setState, s.id); }}
                      style={{
                        border: 'none', background: 'transparent', cursor: 'pointer', padding: 6,
                        color: '#E55934',
                      }}><Icon.Star width="18" height="18" /></button>
                  </div>
                </button>
                <div style={{ padding: '4px 0 4px 28px' }}>
                  {ds.map((d, i) => (
                    <React.Fragment key={i}>
                      <DepartureRow dep={d} dark={dark} format={theme.timeFormat} compact />
                      {i === 0 && (
                        <div style={{ height: 1, marginLeft: 18,
                          background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Station Detail ───────────────────────────────────────────
function StationDetailScreen({ state, setState, theme }) {
  const dark = theme.dark;
  const station = STATION_BY_ID[state.detailId];
  const [now, setNow] = useStateS(Date.now() + (state.timeOffset || 0));
  useEffectS(() => { const t = setInterval(() => setNow(Date.now() + (state.timeOffset || 0)), 30000); return () => clearInterval(t); }, [state.timeOffset]);
  const [direction, setDirection] = useStateS('all');

  const all = useMemoS(() => generateDepartures(station, now, 14), [station.id, Math.floor(now / 60000)]);
  const pinned = state.favourites.includes(station.id);

  return (
    <div style={{ padding: '0 0 120px' }}>
      {/* nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px 4px',
      }}>
        <button onClick={() => setState({ ...state, screen: null, detailId: null })} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 8,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: dark ? '#fff' : '#0a0a0a', fontSize: 15, fontWeight: 500,
        }}><Icon.Back width="20" height="20" /> Back</button>
        <button
          onClick={() => toggleFavourite(state, setState, station.id)}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 8,
            color: pinned ? '#E55934' : (dark ? '#fff' : '#0a0a0a'),
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500,
          }}>
          {pinned ? <Icon.Star width="18" height="18" /> : <Icon.StarO width="18" height="18" />}
          {pinned ? 'Pinned' : 'Pin'}
        </button>
      </div>

      <div style={{ padding: '12px 20px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
          {station.area} · Zone {station.zone}
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 40, lineHeight: 0.98, letterSpacing: '-0.035em',
          margin: '6px 0 14px', color: dark ? '#fff' : '#0a0a0a',
          textWrap: 'balance',
        }}>{station.name}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {station.lines.map(id => <LineChip key={id} id={id} dark={dark} />)}
        </div>
      </div>

      {/* direction filter */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6 }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'A',   label: 'Platform A' },
          { id: 'B',   label: 'Platform B' },
        ].map(t => {
          const active = direction === t.id;
          return (
            <button key={t.id} onClick={() => setDirection(t.id)} style={{
              padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
              border: `0.5px solid ${active ? (dark ? '#fff' : '#0a0a0a') : (dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)')}`,
              background: active ? (dark ? '#fff' : '#0a0a0a') : (dark ? 'rgba(28,28,30,0.45)' : 'rgba(255,255,255,0.5)'),
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              color: active ? (dark ? '#0a0a0a' : '#fff') : (dark ? '#fff' : '#0a0a0a'),
              fontSize: 13, fontWeight: 500,
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* departures */}
      <div style={{
        margin: '0 16px', overflow: 'hidden',
        ...glass(dark, { rad: 24 }),
      }}>
        <div style={{ padding: '4px 0 4px 16px' }}>
          {all.filter(d => direction === 'all' || d.platform === direction).map((d, i, arr) => (
            <React.Fragment key={i}>
              <DepartureRow dep={d} dark={dark} format={theme.timeFormat} compact={theme.dense} />
              {i < arr.length - 1 && (
                <div style={{ height: 1, marginLeft: 18,
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Switch Station bottom sheet ──────────────────────────────
function SwitchStationSheet({ state, setState, theme }) {
  const dark = theme.dark;
  const [q, setQ] = useStateS('');
  const results = useMemoS(() => {
    if (!q.trim()) return STATIONS.slice(0, 8);
    const k = q.trim().toLowerCase();
    return STATIONS.filter(s => s.name.toLowerCase().includes(k)).slice(0, 30);
  }, [q]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={() => setState({ ...state, sheet: null })} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
      }} />
      <div style={{
        position: 'relative', width: '100%', maxHeight: '78%',
        ...glass(dark, { rad: 0, blur: 40, opacity: dark ? 0.7 : 0.78 }),
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.25), inset 0 0.5px 0 rgba(255,255,255,0.6)',
        display: 'flex', flexDirection: 'column',
        animation: 'sheetUp 0.28s cubic-bezier(.2,.7,.2,1)',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 999, alignSelf: 'center', margin: '10px 0',
          background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }} />
        <div style={{ padding: '0 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: dark ? '#fff' : '#0a0a0a' }}>Choose a station</div>
          <button onClick={() => setState({ ...state, sheet: null })} style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
            padding: 4,
          }}><Icon.X width="18" height="18" /></button>
        </div>
        <div style={{ padding: '8px 16px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 14,
            background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(255,255,255,0.7)',
          }}>
            <Icon.Search width="18" height="18" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search stations" style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, fontFamily: 'var(--font-sans)',
              color: dark ? '#fff' : '#0a0a0a',
            }} />
          </div>
        </div>
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 0 24px' }}>
          {!q && (
            <div style={{
              padding: '8px 24px 4px', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            }}>Suggested</div>
          )}
          {results.map(s => (
            <button key={s.id} onClick={() => setState({ ...state, currentStation: s.id, sheet: null })} style={{
              width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              padding: '12px 24px', background: 'transparent',
              display: 'flex', alignItems: 'center', gap: 12,
              color: dark ? '#fff' : '#0a0a0a',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{s.name}</div>
                <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                  color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                  <LineStrip ids={s.lines} size={7} gap={3} />
                  <span>Zone {s.zone}</span>
                </div>
              </div>
              {state.currentStation === s.id && (
                <span style={{ fontSize: 12, color: '#E55934', fontWeight: 600 }}>Current</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────
function toggleFavourite(state, setState, id) {
  const has = state.favourites.includes(id);
  const next = has ? state.favourites.filter(x => x !== id) : [...state.favourites, id];
  setState({ ...state, favourites: next });
}

Object.assign(window, {
  NowScreen, BrowseScreen, FavouritesScreen, StationDetailScreen, SwitchStationSheet,
  toggleFavourite,
});
