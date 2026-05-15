/* ============================================================
   Main app — sidebar list, mode switch, stage render, props panel,
   drag-and-drop wiring, PNG export.
   ============================================================ */
(function (P) {
  const $ = id => document.getElementById(id);
  const esc = P.esc;

  // ---------- app state ----------
  const app = {
    mode: "preview",         // preview | design
    scheme: "light",         // light | dark — applies to mockup-card variant default
    bg: "mockup",            // mockup | plain
    device: "fold-closed",   // fold-closed | fold-open
    zoom: 1,                 // user-relative zoom; 1 = device's natural default view
                             // (1:1 for outer, fit-to-stage-width for inner).
                             // Export always at natural device size.
    selection: null,         // { kind: "preset"|"component", id }
  };

  // Foldable device dimensions, point-equivalent. Same point density
  // across outer and inner, so the Live Activity stays the same size
  // on both — only the surrounding device frame changes shape.
  const DEVICE_INFO = {
    "fold-closed":  { label: "iPhone Fold · outer (5.5\" · 4:3)", cardWidth: 360, caption: "Fold outer · 5.5″ · 4:3 portrait · 508 × 678 pt" },
    "fold-open":    { label: "iPhone Fold · inner (7.9\" · 3:2)", cardWidth: 360, caption: "Fold inner · 7.9″ · 3:2 landscape · 1016 × 678 pt (derived from 4:3 outer)" },
  };

  const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

  // ---------- sidebar list ----------
  function buildSidebar() {
    const nav = $("sidebarNav");
    const search = ($("searchInput").value || "").trim().toLowerCase();

    // Group presets by category
    const presetByCat = {};
    Object.values(P.presets).forEach(p => {
      if (search && !p.name.toLowerCase().includes(search) && !p.category.toLowerCase().includes(search)) return;
      (presetByCat[p.category] = presetByCat[p.category] || []).push(p);
    });

    // Group components by category
    const compByCat = {};
    Object.values(P.components).forEach(c => {
      if (search && !c.name.toLowerCase().includes(search) && !c.category.toLowerCase().includes(search)) return;
      (compByCat[c.category] = compByCat[c.category] || []).push(c);
    });

    let html = `<div class="section-head">Examples</div>`;
    Object.keys(presetByCat).sort().forEach(cat => {
      html += `<div class="section-head" style="padding-top:6px;">${esc(cat)}</div>`;
      presetByCat[cat].forEach(p => {
        const active = app.selection && app.selection.kind === "preset" && app.selection.id === p.id ? " active" : "";
        html += `
          <div class="nav-item kind-preset${active}" data-kind="preset" data-id="${p.id}">
            <span class="dot"></span><span class="label">${esc(p.name)}</span>
          </div>
        `;
      });
    });

    html += `<div class="section-head" style="margin-top:14px;">Components</div>`;
    Object.keys(compByCat).sort().forEach(cat => {
      html += `<div class="section-head" style="padding-top:6px;">${esc(cat)}</div>`;
      compByCat[cat].forEach(c => {
        const active = app.selection && app.selection.kind === "component" && app.selection.id === c.id ? " active" : "";
        html += `
          <div class="nav-item kind-component${active}" data-kind="component" data-id="${c.id}" draggable="true">
            <span class="dot"></span><span class="label">${esc(c.name)}</span>
          </div>
        `;
      });
    });

    nav.innerHTML = html;
  }

  // Scroll the stage so its content sits in the middle of the viewport.
  // Lets overflowing-but-centered content (e.g. the fold-inner display
  // wider than the stage) feel anchored, not pinned to the start.
  function centerStageScroll() {
    const stage = $("stage");
    if (!stage) return;
    requestAnimationFrame(() => {
      stage.scrollLeft = Math.max(0, (stage.scrollWidth - stage.clientWidth) / 2);
      stage.scrollTop  = Math.max(0, (stage.scrollHeight - stage.clientHeight) / 2);
    });
  }

  // Default-view scale per device. Outer renders 1:1 ("100%" = real
  // point size). Inner is wider than most stages, so its default-view
  // scale fits its 1016pt width into the available stage width — this
  // way "100%" still feels like the natural way to see the device.
  function getNaturalZoom() {
    if (app.device !== "fold-open") return 1;
    const stage = $("stage");
    if (!stage) return 1;
    const padding = 64;
    const deviceWidth = 1016;
    return Math.min(1, (stage.clientWidth - padding) / deviceWidth);
  }

  function applyZoom() {
    const effective = getNaturalZoom() * app.zoom;
    document.querySelectorAll(".zoom-host").forEach(el => {
      el.style.setProperty("--zoom", effective);
    });
  }

  // ---------- stage render ----------
  function renderStage() {
    const stage = $("stage");
    const deviceCls = "device-" + app.device;
    const deviceCap = DEVICE_INFO[app.device].caption;

    if (app.mode === "design") {
      const designCard = P.canvas.renderDesignCard();
      const wrapped = app.bg === "mockup" ? P.renderMockup(designCard, { dark: app.scheme === "dark" }) : designCard;
      stage.innerHTML = `
        <div class="stage-wrap ${deviceCls}">
          <div class="stage-caption">Design canvas — drag components from the sidebar · ${esc(deviceCap)}</div>
          <div class="canvas-host"><div class="zoom-host">${wrapped}</div></div>
        </div>
      `;
      wireCanvasInteractions();
      applyZoom();
      centerStageScroll();
      return;
    }

    if (!app.selection) {
      stage.innerHTML = `<div class="empty">Pick an item from the sidebar.</div>`;
      return;
    }

    if (app.selection.kind === "preset") {
      const preset = P.presets[app.selection.id];
      if (!preset) { stage.innerHTML = `<div class="empty">Missing preset.</div>`; return; }
      const shape = preset.build();
      const cardHtml = P.renderCard(shape.stack, shape.card);
      const wrapped = app.bg === "mockup" ? P.renderMockup(cardHtml, { dark: app.scheme === "dark" }) : cardHtml;
      stage.innerHTML = `
        <div class="stage-wrap ${deviceCls}">
          <div class="stage-caption">${esc(preset.name)} · ${esc(deviceCap)}</div>
          <div class="zoom-host">${wrapped}</div>
        </div>
      `;
      $("topbarTitle").textContent = preset.name;
      applyZoom();
      centerStageScroll();
      return;
    }

    if (app.selection.kind === "component") {
      const comp = P.components[app.selection.id];
      if (!comp) { stage.innerHTML = `<div class="empty">Missing component.</div>`; return; }
      const props = comp.defaults || {};
      const cardHtml = P.renderCard([{ component: comp.id, props }], { variant: app.scheme === "dark" ? "dark" : "light", lineColor: "#3FA9B5" });
      const wrapped = app.bg === "mockup" ? P.renderMockup(cardHtml, { dark: app.scheme === "dark" }) : cardHtml;
      stage.innerHTML = `
        <div class="stage-wrap ${deviceCls}">
          <div class="stage-caption">Component · ${esc(comp.name)} · ${esc(deviceCap)}</div>
          <div class="zoom-host">${wrapped}</div>
        </div>
      `;
      $("topbarTitle").textContent = comp.name;
      applyZoom();
      centerStageScroll();
      return;
    }
  }

  // ---------- props panel ----------
  function renderProps() {
    const body = $("propsBody");

    if (app.mode === "design") {
      let html = renderCardProps();
      if (P.canvas.selectedId) {
        const inst = P.canvas.state.stack.find(x => x.id === P.canvas.selectedId);
        if (inst) {
          html += `<div class="props-section">
            <div class="props-section-title">${esc(P.components[inst.component].name)}</div>
            ${renderInstanceForm(inst)}
          </div>`;
        }
      } else if (P.canvas.state.stack.length === 0) {
        html += `<div class="empty small" style="margin-top:14px;">Drag a component onto the canvas to start.</div>`;
      } else {
        html += `<div class="empty small" style="margin-top:14px;">Select a component on the canvas to edit it.</div>`;
      }
      body.innerHTML = html;
      wirePropsInteractions();
      return;
    }

    if (!app.selection) { body.innerHTML = `<div class="empty small">No selection</div>`; return; }

    if (app.selection.kind === "component") {
      const comp = P.components[app.selection.id];
      const fake = { id: "__demo", component: comp.id, props: Object.assign({}, comp.defaults || {}) };
      body.innerHTML = `
        <div class="empty small" style="margin-bottom:10px;">Edit the component's default props to preview different states. Changes here aren't saved — switch to Design to actually build.</div>
        ${renderInstanceForm(fake, true)}
      `;
      // wire as live overrides
      body.querySelectorAll("[data-prop-key]").forEach(el => {
        el.addEventListener("input", () => {
          const k = el.dataset.propKey;
          comp.defaults[k] = readField(el);
          renderStage();
        });
      });
      return;
    }

    // preset selected — show "load to canvas" + a preview of the stack
    if (app.selection.kind === "preset") {
      const preset = P.presets[app.selection.id];
      const built = preset.build();
      const items = built.stack.map((it, i) =>
        `<div style="font-size:12px;color:var(--muted);padding:2px 0;">${i+1}. ${esc(P.components[it.component] ? P.components[it.component].name : it.component)}</div>`
      ).join("");
      body.innerHTML = `
        <div style="margin-bottom:10px;font-size:12px;">
          <strong>${esc(preset.name)}</strong>
        </div>
        <div style="margin-bottom:14px;">${items}</div>
        <button class="btn" id="loadToCanvasBtn" style="width:100%;">Open in design canvas</button>
      `;
      $("loadToCanvasBtn").addEventListener("click", () => {
        P.canvas.loadFromPreset(app.selection.id);
        setMode("design");
      });
      return;
    }
  }

  function renderCardProps() {
    const c = P.canvas.state.card;
    const opts = P.cardVariants.map(v =>
      `<option value="${v.value}"${v.value === c.variant ? " selected" : ""}>${esc(v.label)}</option>`
    ).join("");
    return `
      <div class="props-section-title">Card</div>
      <label class="field">
        <div class="field-label">Variant</div>
        <select data-card-key="variant">${opts}</select>
      </label>
      <label class="field">
        <div class="field-label">Line / accent colour</div>
        <input type="color" data-card-key="lineColor" value="${c.lineColor}" />
      </label>
    `;
  }

  function renderInstanceForm(inst, isComponent) {
    const def = P.components[inst.component];
    if (!def) return "";
    return def.schema.map(field => renderFieldRow(inst.props, field, inst.id)).join("");
  }

  function renderFieldRow(props, field, instanceId) {
    const v = props[field.key];
    const labelHtml = `<div class="field-label">${esc(field.label)}</div>`;
    const attrs = `data-prop-key="${field.key}" data-instance-id="${esc(instanceId)}"`;

    switch (field.type) {
      case "text":
        return `<label class="field">${labelHtml}<input type="text" ${attrs} value="${esc(v)}" /></label>`;
      case "textarea":
        return `<label class="field">${labelHtml}<textarea ${attrs}>${esc(v)}</textarea></label>`;
      case "number":
        return `<label class="field">${labelHtml}<input type="number" ${attrs} value="${esc(v)}" min="${field.min ?? ""}" max="${field.max ?? ""}" /></label>`;
      case "time":
        return `<label class="field">${labelHtml}<input type="time" ${attrs} value="${esc(v)}" /></label>`;
      case "color":
        return `<label class="field">${labelHtml}<input type="color" ${attrs} value="${esc(v || "#000000")}" /></label>`;
      case "bool":
        return `<label class="field" style="display:flex;align-items:center;gap:8px;">
          <input type="checkbox" ${attrs} ${v ? "checked" : ""} />
          <span class="field-label" style="margin:0;">${esc(field.label)}</span>
        </label>`;
      case "select": {
        const opts = (field.options || []).map(o => `<option value="${esc(o)}"${o === v ? " selected" : ""}>${esc(o)}</option>`).join("");
        return `<label class="field">${labelHtml}<select ${attrs}>${opts}</select></label>`;
      }
      default:
        return `<label class="field">${labelHtml}<input type="text" ${attrs} value="${esc(v)}" /></label>`;
    }
  }

  function readField(el) {
    if (el.type === "number") return el.value === "" ? "" : +el.value;
    if (el.type === "checkbox") return el.checked;
    return el.value;
  }

  function wirePropsInteractions() {
    // canvas card props
    document.querySelectorAll("[data-card-key]").forEach(el => {
      el.addEventListener("input", () => {
        P.canvas.updateCard({ [el.dataset.cardKey]: readField(el) });
      });
    });
    // instance prop edits
    document.querySelectorAll("[data-prop-key][data-instance-id]").forEach(el => {
      el.addEventListener("input", () => {
        P.canvas.updateInstanceProps(el.dataset.instanceId, { [el.dataset.propKey]: readField(el) });
      });
    });
  }

  // ---------- canvas interactions ----------
  function wireCanvasInteractions() {
    // drop zones — accept new components from sidebar OR reorders from canvas
    document.querySelectorAll(".canvas-empty, .drop-zone").forEach(zone => {
      zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("over");
      });
      zone.addEventListener("dragleave", () => zone.classList.remove("over"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("over");
        const compId = e.dataTransfer.getData("application/x-component-id");
        const instId = e.dataTransfer.getData("application/x-instance-id");
        const index = +zone.dataset.dropIndex || 0;
        if (compId) P.canvas.addComponent(compId, index);
        else if (instId) P.canvas.moveInstance(instId, index);
      });
    });

    // canvas instances — selectable, draggable for reorder, toolbar actions
    document.querySelectorAll(".canvas-instance").forEach(node => {
      const id = node.dataset.instanceId;
      node.addEventListener("click", e => {
        e.stopPropagation();
        // ignore clicks on toolbar buttons
        if (e.target.closest(".instance-toolbar")) return;
        P.canvas.select(id);
      });
      node.addEventListener("dragstart", e => {
        e.dataTransfer.setData("application/x-instance-id", id);
        e.dataTransfer.effectAllowed = "move";
        node.classList.add("dragging");
      });
      node.addEventListener("dragend", () => node.classList.remove("dragging"));
    });

    // toolbar buttons
    document.querySelectorAll(".canvas-instance .instance-toolbar button").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const node = btn.closest(".canvas-instance");
        const id = node.dataset.instanceId;
        const action = btn.dataset.action;
        const idx = P.canvas.state.stack.findIndex(x => x.id === id);
        if (action === "del") P.canvas.removeInstance(id);
        else if (action === "dup") P.canvas.duplicateInstance(id);
        else if (action === "up" && idx > 0) P.canvas.moveInstance(id, idx - 1);
        else if (action === "down" && idx < P.canvas.state.stack.length - 1) P.canvas.moveInstance(id, idx + 2);
      });
    });

    // clicking blank area inside the canvas card deselects
    const canvasCard = document.getElementById("canvasCard");
    if (canvasCard) {
      canvasCard.addEventListener("click", e => {
        if (e.target === canvasCard) P.canvas.select(null);
      });
    }
  }

  // ---------- sidebar interactions ----------
  function wireSidebar() {
    $("sidebarNav").addEventListener("click", e => {
      const item = e.target.closest(".nav-item");
      if (!item) return;
      app.selection = { kind: item.dataset.kind, id: item.dataset.id };
      buildSidebar();
      renderStage();
      renderProps();
    });

    // drag from sidebar (component items only)
    $("sidebarNav").addEventListener("dragstart", e => {
      const item = e.target.closest(".nav-item[draggable='true']");
      if (!item) return;
      e.dataTransfer.setData("application/x-component-id", item.dataset.id);
      e.dataTransfer.effectAllowed = "copy";
    });

    $("searchInput").addEventListener("input", buildSidebar);
  }

  // ---------- mode + topbar ----------
  function setMode(mode) {
    app.mode = mode;
    document.querySelectorAll(".mode-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    $("topbarTitle").textContent = mode === "design" ? "Design canvas" : "Preview";
    renderStage();
    renderProps();
  }

  function wireTopbar() {
    document.querySelectorAll(".mode-btn").forEach(b => {
      b.addEventListener("click", () => setMode(b.dataset.mode));
    });
    document.querySelectorAll("[data-scheme]").forEach(b => {
      b.addEventListener("click", () => {
        app.scheme = b.dataset.scheme;
        b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
        renderStage();
      });
    });
    document.querySelectorAll("[data-bg]").forEach(b => {
      b.addEventListener("click", () => {
        app.bg = b.dataset.bg;
        b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
        renderStage();
      });
    });
    document.querySelectorAll("[data-device]").forEach(b => {
      b.addEventListener("click", () => {
        app.device = b.dataset.device;
        b.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
        renderStage();
      });
    });

    $("zoomIn").addEventListener("click", () => {
      const next = ZOOM_STEPS.find(s => s > app.zoom + 1e-3);
      setZoom(next == null ? ZOOM_STEPS[ZOOM_STEPS.length - 1] : next);
    });
    $("zoomOut").addEventListener("click", () => {
      const before = [...ZOOM_STEPS].reverse().find(s => s < app.zoom - 1e-3);
      setZoom(before == null ? ZOOM_STEPS[0] : before);
    });
    $("zoomReset").addEventListener("click", () => setZoom(1));

    $("exportBtn").addEventListener("click", exportPng);
  }

  function setZoom(z) {
    app.zoom = z;
    $("zoomReset").textContent = Math.round(z * 100) + "%";
    applyZoom();
    centerStageScroll();
  }

  // ---------- export ----------
  // Always exports at natural (1×) size, ignoring current view zoom.
  // offsetWidth/Height aren't affected by the parent transform, so we
  // pass them explicitly so html-to-image doesn't pick up the scaled
  // visual bounds.
  async function exportPng() {
    let node;
    if (app.bg === "mockup") {
      node = document.getElementById("mockupRoot");
    } else {
      node = document.querySelector(".widget-card");
    }
    if (!node) return;
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      width: w,
      height: h,
      style: { transform: "none" },
    });
    const a = document.createElement("a");
    a.download = `live-activity-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();
  }

  // ---------- init ----------
  function init() {
    buildSidebar();
    wireSidebar();
    wireTopbar();
    P.canvas.subscribe(() => {
      if (app.mode === "design") {
        renderStage();
        renderProps();
      }
    });
    // Pick a default selection so the user lands on something visual.
    if (P.presets["weather-alert"]) {
      app.selection = { kind: "preset", id: "weather-alert" };
      buildSidebar();
    }
    // Recompute inner-device fit-to-width when the window resizes.
    window.addEventListener("resize", () => {
      applyZoom();
      centerStageScroll();
    });
    renderStage();
    renderProps();
  }

  document.addEventListener("DOMContentLoaded", init);
})(window.Playground);
