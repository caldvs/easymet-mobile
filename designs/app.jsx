// app.jsx — root component, tabs, tweaks integration
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "dense": false,
  "timeFormat": "mins",
  "accent": "coral"
}/*EDITMODE-END*/;

const ACCENTS = {
  coral:  { fg: '#E55934', name: 'Coral' },
  slate:  { fg: '#2F3640', name: 'Slate' },
  forest: { fg: '#22A06B', name: 'Forest' },
  cobalt: { fg: '#2A6FDB', name: 'Cobalt' },
};

function MetrolinkApp() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [state, setState] = useStateA({
    tab: 'now',             // now | browse | favourites
    screen: null,           // null | 'station'
    detailId: null,
    sheet: null,            // null | 'switch-station'
    currentStation: 'sps',  // St Peter's Square
    favourites: ['picg', 'mcu', 'alt'],
    timeOffset: 0,
  });

  const dark = tweaks.theme === 'dark';
  const theme = { dark, dense: tweaks.dense, timeFormat: tweaks.timeFormat, accent: ACCENTS[tweaks.accent] || ACCENTS.coral };

  // Render either the active tab, or the station detail overlay.
  let content;
  if (state.screen === 'station') {
    content = <StationDetailScreen state={state} setState={setState} theme={theme} />;
  } else if (state.tab === 'now') {
    content = <NowScreen state={state} setState={setState} theme={theme} />;
  } else if (state.tab === 'browse') {
    content = <BrowseScreen state={state} setState={setState} theme={theme} />;
  } else {
    content = <FavouritesScreen state={state} setState={setState} theme={theme} />;
  }

  const bg = dark ? '#0B0B0E' : '#F4EFE6';
  const fg = dark ? '#fff' : '#0a0a0a';

  return (
    <>
      {/* CSS vars on the device root */}
      <div style={{
        position: 'absolute', inset: 0, background: bg, color: fg,
        '--font-sans': "'DM Sans', system-ui, sans-serif",
        '--font-display': "'Bricolage Grotesque', 'DM Sans', sans-serif",
        '--font-mono': "'JetBrains Mono', ui-monospace, monospace",
        '--accent': theme.accent.fg,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        overflow: 'hidden',
      }}>
        {/* color orbs — backdrop that the frosted glass blurs over */}
        <BackdropOrbs dark={dark} accent={theme.accent.fg} />

        {/* status bar gap */}
        <div style={{ height: 56, position: 'relative', zIndex: 2 }} />
        {/* scrollable content area — transparent so the orbs show through */}
        <div style={{
          position: 'absolute', top: 56, bottom: 0, left: 0, right: 0,
          overflowY: 'auto', WebkitOverflowScrolling: 'touch', zIndex: 2,
        }} key={state.screen === 'station' ? 'station-' + state.detailId : state.tab}>
          {content}
        </div>

        {/* bottom tab bar — hide when on a sub-screen */}
        {state.screen !== 'station' && (
          <TabBar state={state} setState={setState} dark={dark} />
        )}

        {/* sheets */}
        {state.sheet === 'switch-station' && (
          <SwitchStationSheet state={state} setState={setState} theme={theme} />
        )}
      </div>

      <TweakControls tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

function BackdropOrbs({ dark, accent }) {
  // Three soft tinted blobs in fixed positions. They give the frosted glass
  // something to blur. Dimmed in dark mode so the surfaces stay legible.
  const a = dark ? 0.45 : 0.55;
  const orbs = [
    { top: '4%',   left: '-18%', size: 320, color: accent,  alpha: a },
    { top: '32%',  right: '-22%', size: 340, color: '#3FA9B5', alpha: a * 0.95 },
    { top: '58%',  left: '-20%', size: 300, color: '#F2C14E', alpha: a * 0.9 },
    { bottom: '6%', right: '-12%', size: 280, color: '#8E5BD9', alpha: a * 0.8 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1, pointerEvents: 'none' }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: 'absolute', width: o.size, height: o.size, borderRadius: '50%',
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          background: `radial-gradient(circle, ${o.color}${Math.round(o.alpha * 255).toString(16).padStart(2,'0')} 0%, ${o.color}00 70%)`,
          filter: 'blur(10px)',
        }} />
      ))}
    </div>
  );
}

function TabBar({ state, setState, dark }) {
  const tabs = [
    { id: 'now',        label: 'Now',        icon: Icon.Now },
    { id: 'browse',     label: 'Browse',     icon: Icon.List },
    { id: 'favourites', label: 'Pinned',     icon: Icon.Star },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      padding: '8px 16px 32px',
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4,
        padding: 6, pointerEvents: 'auto',
        ...glass(dark, { rad: 999, blur: 36, opacity: dark ? 0.45 : 0.6 }),
      }}>
        {tabs.map(t => {
          const active = state.tab === t.id && !state.screen;
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setState({ ...state, tab: t.id, screen: null, detailId: null })}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 0', borderRadius: 999, cursor: 'pointer',
                border: 'none',
                background: active ? (dark ? '#fff' : '#0a0a0a') : 'transparent',
                color: active ? (dark ? '#0a0a0a' : '#fff') : (dark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)'),
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
                transition: 'background 0.18s, color 0.18s',
                whiteSpace: 'nowrap',
              }}>
              <TabIcon width="17" height="17" />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TweakControls({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme">
        <TweakRadio
          label="Mode"
          value={tweaks.theme}
          options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}
          onChange={v => setTweak('theme', v)}
        />
        <TweakColor
          label="Accent"
          value={ACCENTS[tweaks.accent].fg}
          options={Object.values(ACCENTS).map(a => a.fg)}
          onChange={hex => {
            const k = Object.entries(ACCENTS).find(([,v]) => v.fg === hex)?.[0] || 'coral';
            setTweak('accent', k);
          }}
        />
      </TweakSection>
      <TweakSection label="Departures">
        <TweakRadio
          label="Time format"
          value={tweaks.timeFormat}
          options={[{value:'mins',label:'Minutes'},{value:'clock',label:'Clock'}]}
          onChange={v => setTweak('timeFormat', v)}
        />
        <TweakToggle label="Dense rows" value={tweaks.dense} onChange={v => setTweak('dense', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

// ─── mount ────────────────────────────────────────────────────
function Root() {
  // Scale device frame to fit viewport.
  const [scale, setScale] = useStateA(1);
  useEffectA(() => {
    const W = 402, H = 874;
    const compute = () => {
      const sw = window.innerWidth, sh = window.innerHeight;
      const padding = 24;
      const s = Math.min((sw - padding) / W, (sh - padding) / H, 1.1);
      setScale(s);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#1A1A1C',
      display: 'grid', placeItems: 'center', overflow: 'hidden',
    }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice width={402} height={874}>
          <MetrolinkApp />
        </IOSDevice>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
