/* ============================================================
   Reusable building-block components.
   Each defines: id, name, category, defaults, schema, render(props).
   Schema is consumed by the property editor to build form controls.
   Field types: text, number, color, select, time, textarea, bool.
   ============================================================ */
(function (P) {
  const esc = P.esc;

  // -------- brand-header --------
  P.registerComponent({
    id: "brand-header",
    name: "Brand header",
    category: "Headers",
    defaults: {
      brand: "easymet",
      icon: "tram",
      iconColor: "",
      etaLabel: "ETA",
      etaValue: "00:26",
      showEta: true,
    },
    schema: [
      { key: "brand", label: "Brand name", type: "text" },
      { key: "icon", label: "Icon", type: "select", options: ["tram","car","plane","bag","music","pizza","timer","workout","pkg","chart","weather","cal","bolt","game","ball","bus","mic","podcast","pin","moon"] },
      { key: "iconColor", label: "Icon background (blank = line)", type: "color" },
      { key: "showEta", label: "Show ETA", type: "bool" },
      { key: "etaLabel", label: "ETA label", type: "text" },
      { key: "etaValue", label: "ETA value", type: "text" },
    ],
    render(p) {
      const svg = P.svg[p.icon] || P.svg.tram;
      const style = p.iconColor ? `background:${p.iconColor};` : "";
      return `
        <div class="c-brand-header">
          <div class="logo" style="${style}">${svg}</div>
          <div class="brand">${esc(p.brand)}</div>
          <div class="spacer"></div>
          ${p.showEta ? `
            <div class="eta">
              <div class="lbl">${esc(p.etaLabel)}</div>
              <div class="val">${esc(p.etaValue)}</div>
            </div>
          ` : ""}
        </div>
      `;
    }
  });

  // -------- kicker --------
  P.registerComponent({
    id: "kicker",
    name: "Kicker label",
    category: "Headers",
    defaults: { text: "Heading to" },
    schema: [
      { key: "text", label: "Text", type: "text" },
    ],
    render(p) {
      return `<div class="c-kicker">${esc(p.text)}</div>`;
    }
  });

  // -------- headline-row --------
  P.registerComponent({
    id: "headline-row",
    name: "Headline + tag",
    category: "Headers",
    defaults: {
      title: "Wythenshawe Town Centre",
      titleSize: "default",  // small | default | xl
      trail: "in 9 stops",
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "titleSize", label: "Size", type: "select", options: ["small","default","xl"] },
      { key: "trail", label: "Trailing tag (blank = none)", type: "text" },
    ],
    render(p) {
      const sizeCls = p.titleSize === "small" ? " small" : (p.titleSize === "xl" ? " xl" : "");
      return `
        <div class="c-headline-row">
          <div class="title${sizeCls}">${esc(p.title)}</div>
          ${p.trail ? `<div class="trail">${esc(p.trail)}</div>` : ""}
        </div>
      `;
    }
  });

  // -------- progress-rail --------
  P.registerComponent({
    id: "progress-rail",
    name: "Progress rail (transit)",
    category: "Progress",
    defaults: { totalStops: 18, stopsRemaining: 9 },
    schema: [
      { key: "totalStops", label: "Total stops", type: "number", min: 2, max: 40 },
      { key: "stopsRemaining", label: "Stops remaining", type: "number", min: 0, max: 40 },
    ],
    render(p) {
      const total = Math.max(2, +p.totalStops || 2);
      const remaining = Math.max(0, Math.min(total, +p.stopsRemaining || 0));
      const completed = total - remaining;
      const progress = Math.min(Math.max(completed / total, 0.03), 0.97);
      let ticks = "";
      for (let i = 1; i < total; i++) {
        const x = (i / total) * 100;
        const passed = i < completed;
        ticks += `<div class="tick${passed ? " passed" : ""}" style="left:${x}%"></div>`;
      }
      return `
        <div class="c-progress-rail">
          <div class="track"></div>
          <div class="fill" style="width:${progress * 100}%"></div>
          ${ticks}
          <div class="dot origin" style="left:4.5px"></div>
          <div class="dot dest" style="left:calc(100% - 4.5px)"></div>
          <div class="progress" style="left:${progress * 100}%"></div>
        </div>
      `;
    }
  });

  // -------- progress-bar --------
  P.registerComponent({
    id: "progress-bar",
    name: "Progress bar",
    category: "Progress",
    defaults: { percent: 65, leftLabel: "Preparing", rightLabel: "65%" },
    schema: [
      { key: "leftLabel", label: "Left label", type: "text" },
      { key: "rightLabel", label: "Right label", type: "text" },
      { key: "percent", label: "Percent", type: "number", min: 0, max: 100 },
    ],
    render(p) {
      const pct = Math.max(0, Math.min(100, +p.percent || 0));
      return `
        <div class="c-progress-bar">
          <div class="label-row"><span>${esc(p.leftLabel)}</span><span class="right">${esc(p.rightLabel)}</span></div>
          <div class="track"><div class="fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }
  });

  // -------- big-countdown --------
  P.registerComponent({
    id: "big-countdown",
    name: "Big countdown",
    category: "Status",
    defaults: { value: "12:34", label: "remaining" },
    schema: [
      { key: "value", label: "Value", type: "text" },
      { key: "label", label: "Label", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-big-countdown">
          <div class="value">${esc(p.value)}</div>
          <div class="label">${esc(p.label)}</div>
        </div>
      `;
    }
  });

  // -------- footer-sentence --------
  P.registerComponent({
    id: "footer-sentence",
    name: "Footer sentence",
    category: "Footers",
    defaults: { pre: "Next stop is", strong: "Sale", tail: "in 2 min" },
    schema: [
      { key: "pre", label: "Prefix", type: "text" },
      { key: "strong", label: "Strong word", type: "text" },
      { key: "tail", label: "Trailing tag", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-footer-sentence">
          ${p.pre ? `<div class="pre">${esc(p.pre)}</div>` : ""}
          <div class="strong">${esc(p.strong)}</div>
          ${p.tail ? `<div class="in">${esc(p.tail)}</div>` : ""}
        </div>
      `;
    }
  });

  // -------- score-row --------
  P.registerComponent({
    id: "score-row",
    name: "Score row (sports)",
    category: "Sports",
    defaults: {
      homeCrest: "LAL", homeName: "Lakers", homeScore: 88,
      awayCrest: "BOS", awayName: "Celtics", awayScore: 92,
      clock: "Q3 04:21",
    },
    schema: [
      { key: "homeCrest", label: "Home crest", type: "text" },
      { key: "homeName", label: "Home name", type: "text" },
      { key: "homeScore", label: "Home score", type: "number" },
      { key: "awayCrest", label: "Away crest", type: "text" },
      { key: "awayName", label: "Away name", type: "text" },
      { key: "awayScore", label: "Away score", type: "number" },
      { key: "clock", label: "Clock / period", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-score-row">
          <div class="team">
            <div class="crest">${esc(p.homeCrest)}</div>
            <div class="nm">${esc(p.homeName)}</div>
          </div>
          <div class="stack gap-2" style="align-items:center;">
            <div class="scoreline">
              <span class="score">${esc(p.homeScore)}</span>
              <span class="sep">–</span>
              <span class="score">${esc(p.awayScore)}</span>
            </div>
            <div class="clock">${esc(p.clock)}</div>
          </div>
          <div class="team right">
            <div class="crest">${esc(p.awayCrest)}</div>
            <div class="nm">${esc(p.awayName)}</div>
          </div>
        </div>
      `;
    }
  });

  // -------- courier-row --------
  P.registerComponent({
    id: "courier-row",
    name: "Courier row",
    category: "Delivery",
    defaults: { initials: "AM", name: "Andrei M.", meta: "Delivering your order", arrivalLabel: "Arrives", arrivalValue: "5 min" },
    schema: [
      { key: "initials", label: "Initials", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "meta", label: "Meta", type: "text" },
      { key: "arrivalLabel", label: "Arrival label", type: "text" },
      { key: "arrivalValue", label: "Arrival value", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-courier-row">
          <div class="avatar">${esc(p.initials)}</div>
          <div class="text">
            <div class="name">${esc(p.name)}</div>
            <div class="meta">${esc(p.meta)}</div>
          </div>
          <div class="arrival">
            ${esc(p.arrivalLabel)}
            <span class="val">${esc(p.arrivalValue)}</span>
          </div>
        </div>
      `;
    }
  });

  // -------- action-buttons --------
  P.registerComponent({
    id: "action-buttons",
    name: "Action buttons",
    category: "Actions",
    defaults: { primary: "Track", secondary: "Call", danger: "" },
    schema: [
      { key: "primary", label: "Primary text (blank = hide)", type: "text" },
      { key: "secondary", label: "Secondary text", type: "text" },
      { key: "danger", label: "Danger text (blank = hide)", type: "text" },
    ],
    render(p) {
      const parts = [];
      if (p.primary) parts.push(`<button class="ab primary">${esc(p.primary)}</button>`);
      if (p.secondary) parts.push(`<button class="ab">${esc(p.secondary)}</button>`);
      if (p.danger) parts.push(`<button class="ab danger">${esc(p.danger)}</button>`);
      return `<div class="c-action-buttons">${parts.join("")}</div>`;
    }
  });

  // -------- status-pill --------
  P.registerComponent({
    id: "status-pill",
    name: "Status pill",
    category: "Status",
    defaults: { text: "Live", kind: "live" },
    schema: [
      { key: "text", label: "Text", type: "text" },
      { key: "kind", label: "Kind", type: "select", options: ["live", "success", "warning", "neutral"] },
    ],
    render(p) {
      return `<div class="c-status-pill ${esc(p.kind)}"><span class="dot"></span>${esc(p.text)}</div>`;
    }
  });

  // -------- item-list --------
  P.registerComponent({
    id: "item-list",
    name: "Item list",
    category: "Content",
    defaults: {
      items: "Margherita pizza\t£12.50\nGarlic bread\t£4.00\nCoke\t£2.50",
      totalLabel: "Total",
      totalValue: "£19.00",
    },
    schema: [
      { key: "items", label: "Items (one per line, name<tab>value)", type: "textarea" },
      { key: "totalLabel", label: "Total label (blank = hide)", type: "text" },
      { key: "totalValue", label: "Total value", type: "text" },
    ],
    render(p) {
      const lines = String(p.items || "").split("\n").map(l => l.trim()).filter(Boolean);
      const rows = lines.map(l => {
        const [lhs, rhs] = l.split("\t");
        return `<div class="it"><div class="lhs">${esc(lhs || "")}</div><div class="rhs">${esc(rhs || "")}</div></div>`;
      }).join("");
      const total = p.totalLabel ? `<div class="it total"><div class="lhs">${esc(p.totalLabel)}</div><div class="rhs">${esc(p.totalValue || "")}</div></div>` : "";
      return `<div class="c-item-list">${rows}${total}</div>`;
    }
  });

  // -------- map-thumb --------
  P.registerComponent({
    id: "map-thumb",
    name: "Map thumb",
    category: "Content",
    defaults: {},
    schema: [],
    render() {
      return `
        <div class="c-map-thumb">
          <div class="route"></div>
          <div class="pin start"></div>
          <div class="pin end"></div>
        </div>
      `;
    }
  });

  // -------- big-stat --------
  P.registerComponent({
    id: "big-stat",
    name: "Big stat",
    category: "Status",
    defaults: { value: "287", caption: "calories" },
    schema: [
      { key: "value", label: "Value", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-big-stat">
          <div class="value">${esc(p.value)}</div>
          <div class="caption">${esc(p.caption)}</div>
        </div>
      `;
    }
  });

  // -------- two-col-stats --------
  P.registerComponent({
    id: "two-col-stats",
    name: "Two-column stats",
    category: "Status",
    defaults: { leftVal: "287", leftCap: "kcal", rightVal: "00:42:11", rightCap: "elapsed" },
    schema: [
      { key: "leftVal", label: "Left value", type: "text" },
      { key: "leftCap", label: "Left caption", type: "text" },
      { key: "rightVal", label: "Right value", type: "text" },
      { key: "rightCap", label: "Right caption", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-two-col-stats">
          <div class="c-big-stat"><div class="value">${esc(p.leftVal)}</div><div class="caption">${esc(p.leftCap)}</div></div>
          <div class="c-big-stat"><div class="value">${esc(p.rightVal)}</div><div class="caption">${esc(p.rightCap)}</div></div>
        </div>
      `;
    }
  });

  // -------- divider --------
  P.registerComponent({
    id: "divider",
    name: "Divider",
    category: "Layout",
    defaults: {},
    schema: [],
    render() { return `<div class="c-divider"></div>`; }
  });

  // -------- timer-pill --------
  P.registerComponent({
    id: "timer-pill",
    name: "Timer pill",
    category: "Status",
    defaults: { label: "Brewing", value: "03:42" },
    schema: [
      { key: "label", label: "Label", type: "text" },
      { key: "value", label: "Value", type: "text" },
    ],
    render(p) {
      return `<div class="c-timer-pill"><span class="lbl">${esc(p.label)}</span><span class="val">${esc(p.value)}</span></div>`;
    }
  });

  // -------- music-row --------
  P.registerComponent({
    id: "music-row",
    name: "Music row",
    category: "Content",
    defaults: { title: "Heat Waves", sub: "Glass Animals · Dreamland" },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "sub", label: "Sub", type: "text" },
    ],
    render(p) {
      return `
        <div class="c-music-row">
          <div class="art"></div>
          <div class="text">
            <div class="title">${esc(p.title)}</div>
            <div class="sub">${esc(p.sub)}</div>
          </div>
          <div class="controls">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l12 8-12 8z"/></svg>
          </div>
        </div>
      `;
    }
  });

})(window.Playground);
