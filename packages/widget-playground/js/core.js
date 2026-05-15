/* ============================================================
   Playground core — registry, render dispatch, prop schemas.
   Components and presets register themselves into this namespace.
   ============================================================ */
window.Playground = window.Playground || {};
(function (P) {

  // ---------- registries ----------
  P.components = {};   // id -> { id, name, category, defaults, schema, render }
  P.presets = {};      // id -> { id, name, category, build }

  P.registerComponent = function (def) {
    if (!def.id || !def.render) throw new Error("Component needs id + render");
    P.components[def.id] = Object.assign({
      category: "General",
      defaults: {},
      schema: [],
      preview: null,        // optional: function (defaults) -> props for sidebar preview
    }, def);
  };

  P.registerPreset = function (def) {
    if (!def.id || !def.build) throw new Error("Preset needs id + build");
    P.presets[def.id] = Object.assign({
      category: "Examples",
    }, def);
  };

  // ---------- helpers ----------
  P.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  };

  P.cls = function () {
    return Array.from(arguments).filter(Boolean).join(" ");
  };

  // Resolve {...defaults, ...props} for a component instance
  P.resolveProps = function (componentId, props) {
    const def = P.components[componentId];
    if (!def) return props || {};
    return Object.assign({}, def.defaults, props || {});
  };

  P.renderComponent = function (componentId, props) {
    const def = P.components[componentId];
    if (!def) return `<div class="c-missing">missing: ${componentId}</div>`;
    return def.render(P.resolveProps(componentId, props));
  };

  // ---------- card chrome ----------
  /**
   * stack: array of { component, props } -- the body of the card
   * card: { variant, lineColor } -- styling for the card itself
   */
  P.renderCard = function (stack, card) {
    card = card || {};
    const variant = card.variant || "light";  // light | dark | alight | gradient-blue | gradient-purple | gradient-green
    const lineColor = card.lineColor || "#3FA9B5";
    const cls = P.cls("widget-card", variant !== "light" ? variant : "");
    const body = (stack || []).map(item => {
      const html = P.renderComponent(item.component, item.props);
      return html;
    }).join("");
    return `<div class="widget-card-host"><div class="${cls}" style="--line-color:${lineColor};--accent:${lineColor};"><div class="stack-default">${body}</div></div></div>`;
  };

  // ---------- mockup wrapper ----------
  P.renderMockup = function (cardHtml, opts) {
    opts = opts || {};
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    const cls = P.cls("mockup", opts.dark ? "dark" : "");
    return `
      <div class="${cls}" id="mockupRoot">
        <div class="status"><span>${hh}:${mm}</span><span>📶 🔋</span></div>
        <div class="clock">
          <div class="date">${P.esc(dateLabel)}</div>
          <div class="time">${hh}:${mm}</div>
        </div>
        <div class="slot">${cardHtml}</div>
        <div class="swipe">Swipe up to open</div>
        <div class="home-indicator"></div>
      </div>
    `;
  };

  // ---------- common SVGs ----------
  P.svg = {
    tram:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="5" y="3" width="14" height="14" rx="3" />
        <line x1="5" y1="9" x2="19" y2="9" />
        <circle cx="9" cy="13" r="1.2" fill="#fff" stroke="none" />
        <circle cx="15" cy="13" r="1.2" fill="#fff" stroke="none" />
        <line x1="8" y1="20" x2="7" y2="22" />
        <line x1="16" y1="20" x2="17" y2="22" />
      </svg>`,
    car:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 13l2-6h12l2 6v5H4z" />
        <circle cx="7.5" cy="18" r="1.5" fill="#fff" />
        <circle cx="16.5" cy="18" r="1.5" fill="#fff" />
      </svg>`,
    plane:
      `<svg viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1L15 21v-1.5L13 18v-4.5z" />
      </svg>`,
    bag:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8h12l-1 12H7z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>`,
    music:
      `<svg viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M9 18V6l11-2v12" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>`,
    pizza:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 19l9-15 9 15z" />
        <circle cx="9" cy="14" r="1" fill="#fff" />
        <circle cx="14" cy="14" r="1" fill="#fff" />
        <circle cx="12" cy="9" r="1" fill="#fff" />
      </svg>`,
    timer:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 13V9" />
        <path d="M9 3h6" />
      </svg>`,
    workout:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l2-2 4 4-4 4-2-2z" />
        <path d="M21 9l-2-2-4 4 4 4 2-2z" />
        <line x1="9" y1="11" x2="15" y2="13" />
        <line x1="9" y1="13" x2="15" y2="11" />
      </svg>`,
    pkg:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
        <path d="M3 7l9 4 9-4M12 11v10" />
      </svg>`,
    chart:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 18l5-6 4 3 7-9" />
        <path d="M14 6h6v6" />
      </svg>`,
    weather:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="9" r="3" />
        <path d="M16 17a4 4 0 0 0-8 0c-2 0-3 1.5-3 3h11a3 3 0 0 0 0-3z" fill="#fff" stroke="#fff" />
      </svg>`,
    cal:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="9" y1="4" x2="9" y2="8" />
        <line x1="15" y1="4" x2="15" y2="8" />
      </svg>`,
    bolt:
      `<svg viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
      </svg>`,
    game:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 16c0-4 2-7 5-7h6c3 0 5 3 5 7v2H4z" />
        <line x1="9" y1="12" x2="9" y2="14" />
        <line x1="8" y1="13" x2="10" y2="13" />
        <circle cx="15" cy="13" r="1" fill="#fff" />
      </svg>`,
    ball:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12c4 0 8 4 8 8M21 12c-4 0-8 4-8 8M3 12c4 0 8-4 8-8M21 12c-4 0-8-4-8-8" />
      </svg>`,
    bus:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="4" width="16" height="14" rx="2"/>
        <line x1="4" y1="11" x2="20" y2="11"/>
        <circle cx="8" cy="18" r="1.2" fill="#fff" />
        <circle cx="16" cy="18" r="1.2" fill="#fff" />
      </svg>`,
    mic:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="3" width="6" height="11" rx="3"/>
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>
      </svg>`,
    podcast:
      `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="9" r="2"/>
        <path d="M7 16a5 5 0 1 1 10 0M4 20a9 9 0 1 1 16 0M11 22h2"/>
      </svg>`,
    pin:
      `<svg viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/>
      </svg>`,
    moon:
      `<svg viewBox="0 0 24 24" fill="#fff" stroke="none">
        <path d="M21 13.5A9 9 0 1 1 10.5 3c-.3 0-.6 0-.9.05A7 7 0 0 0 21 13.5z"/>
      </svg>`,
  };

  // ---------- enumerations ----------
  P.cardVariants = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "alight", label: "Alight (red)" },
    { value: "gradient-blue", label: "Blue gradient" },
    { value: "gradient-purple", label: "Purple gradient" },
    { value: "gradient-green", label: "Green gradient" },
  ];

})(window.Playground);
