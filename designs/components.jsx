// components.jsx — shared UI components for the Metrolink Departures app

const { useState, useEffect, useMemo, useRef, useLayoutEffect } = React;

// ─── line indicators ──────────────────────────────────────────
function LineDot({ id, size = 10, ring = false }) {
  const c = LINES[id]?.color || '#999';
  return (
    <span style={{
      width: size, height: size, borderRadius: 999,
      background: c, display: 'inline-block', flex: 'none',
      boxShadow: ring ? `0 0 0 2px ${c}33` : 'none',
    }} />
  );
}

function LineStrip({ ids, size = 9, gap = 4 }) {
  return (
    <span style={{ display: 'inline-flex', gap, alignItems: 'center' }}>
      {ids.map(id => <LineDot key={id} id={id} size={size} />)}
    </span>
  );
}

function LineChip({ id, dark }) {
  const L = LINES[id];
  if (!L) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px 4px 8px',
      borderRadius: 999, fontSize: 12, fontWeight: 500,
      background: L.color + (dark ? '26' : '1F'),
      color: dark ? '#fff' : '#1a1a1a',
      border: `1px solid ${L.color}55`,
    }}>
      <LineDot id={id} size={8} />
      {L.name}
    </span>
  );
}

// ─── time pill ────────────────────────────────────────────────
function TimePill({ mins, status, dark, format = 'mins' }) {
  if (status === 'cancelled') {
    return (
      <div style={{
        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13,
        color: '#C2410C', letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>Cancelled</div>
    );
  }
  const isDue = mins <= 1;
  const txt = isDue ? 'Due' : String(mins);
  if (format === 'clock') {
    const d = new Date(Date.now() + mins * 60000);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return (
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum"',
          fontSize: 26, fontWeight: 500, letterSpacing: '-0.02em',
          color: dark ? '#fff' : '#0a0a0a', lineHeight: 1,
        }}>{hh}:{mm}</div>
        {status === 'delayed' && (
          <div style={{ fontSize: 11, color: '#C2410C', marginTop: 4, fontWeight: 600 }}>Delayed</div>
        )}
      </div>
    );
  }
  return (
    <div style={{ textAlign: 'right', minWidth: 56 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontFeatureSettings: '"tnum"',
        fontSize: isDue ? 22 : 30, fontWeight: 500, letterSpacing: '-0.02em',
        color: status === 'delayed' ? '#C2410C' : (dark ? '#fff' : '#0a0a0a'), lineHeight: 1,
      }}>{txt}</div>
      {!isDue && (
        <div style={{
          fontSize: 11, fontWeight: 500, marginTop: 3,
          color: status === 'delayed' ? '#C2410C' : (dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'),
          letterSpacing: '0.04em', textTransform: 'lowercase',
        }}>{status === 'delayed' ? 'delayed' : 'min'}</div>
      )}
    </div>
  );
}

// ─── departure row ────────────────────────────────────────────
function DepartureRow({ dep, dark, format, compact }) {
  const L = LINES[dep.line];
  const muted = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const padV = compact ? 10 : 14;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: `${padV}px 16px ${padV}px 0`,
      position: 'relative',
    }}>
      {/* line color bar */}
      <div style={{
        width: 4, alignSelf: 'stretch', borderRadius: 999,
        background: L?.color, flex: 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 15 : 17, fontWeight: 500, letterSpacing: '-0.01em',
          color: dark ? '#fff' : '#0a0a0a',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{dep.destination}</div>
        <div style={{
          display: 'flex', gap: 10, marginTop: 3,
          fontSize: 12, color: muted, alignItems: 'center',
          whiteSpace: 'nowrap', overflow: 'hidden',
        }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{L?.name} line</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: muted, flex: 'none' }} />
          <span style={{ fontFamily: 'var(--font-mono)', flex: 'none' }}>{dep.carriages} car</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: muted, flex: 'none' }} />
          <span style={{ flex: 'none' }}>Plat {dep.platform}</span>
        </div>
      </div>
      <TimePill mins={dep.mins} status={dep.status} dark={dark} format={format} />
    </div>
  );
}

// ─── icon set ─────────────────────────────────────────────────
const Icon = {
  Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  Star:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.7l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.7L12 2.5z"/></svg>,
  StarO:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><path d="M12 2.5l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.7l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.7L12 2.5z"/></svg>,
  Chevron:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 6 6 6-6 6"/></svg>,
  Back:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m14 6-6 6 6 6"/></svg>,
  Pin:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16 3l5 5-2 2-1-.5L13 14v5l-1 1-4-4 1-1h5L19 9.5 18.5 8.5 16 3z"/></svg>,
  Loc:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...p}><path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Now:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  List:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  X:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="m6 6 12 12M18 6 6 18"/></svg>,
  Filter: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M4 6h16M7 12h10M10 18h4"/></svg>,
  Refresh:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5 9a8 8 0 0 1 14-1"/><path d="M19 15a8 8 0 0 1-14 1"/></svg>,
  Tram:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><rect x="5" y="3" width="14" height="14" rx="3"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/><path d="M5 9h14"/><path d="m8 20-1 2M16 20l1 2"/></svg>,
};

// ─── small primitives ─────────────────────────────────────────
function PinButton({ pinned, onClick, dark }) {
  const c = pinned ? '#E55934' : (dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');
  return (
    <button onClick={onClick} aria-label={pinned ? 'Unpin' : 'Pin'} style={{
      width: 36, height: 36, borderRadius: 999, border: 'none',
      background: 'transparent', display: 'grid', placeItems: 'center',
      cursor: 'pointer', color: c, transition: 'transform .15s',
    }}>
      {pinned
        ? <Icon.Star width="20" height="20" />
        : <Icon.StarO width="20" height="20" />}
    </button>
  );
}

function SectionLabel({ children, dark }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '20px 20px 8px',
      color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
    }}>{children}</div>
  );
}

// glass helper — iOS-style frosted glass surfaces
function glass(dark, { rad = 24, blur = 30, sat = 180, opacity } = {}) {
  // Default to a relatively solid frost so text-heavy cards stay readable.
  // Callers can pass a lower opacity for chrome / accents.
  const o = opacity != null ? opacity : (dark ? 0.78 : 0.82);
  return {
    background: dark ? `rgba(28,28,30,${o})` : `rgba(255,255,255,${o})`,
    backdropFilter: `blur(${blur}px) saturate(${sat}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%)`,
    border: dark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(255,255,255,0.65)',
    boxShadow: dark
      ? 'inset 0 0.5px 0 rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.32)'
      : 'inset 0 0.5px 0 rgba(255,255,255,0.85), 0 6px 24px rgba(0,0,0,0.06)',
    borderRadius: rad,
  };
}

Object.assign(window, {
  LineDot, LineStrip, LineChip, TimePill, DepartureRow,
  Icon, PinButton, SectionLabel, glass,
});
