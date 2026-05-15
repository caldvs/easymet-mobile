/* ============================================================
   Design canvas — empty card you can drag components onto, reorder,
   select, edit props, and export. Stores the same {card, stack}
   shape as presets so it can be exported / re-rendered uniformly.
   ============================================================ */
(function (P) {

  const canvas = P.canvas = {
    state: {
      card: { variant: "light", lineColor: "#3FA9B5" },
      stack: [],          // [{ id, component, props }]
    },
    selectedId: null,
    listeners: [],
    instanceCounter: 1,
  };

  canvas.emit = function () {
    canvas.listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  };
  canvas.subscribe = function (fn) { canvas.listeners.push(fn); };

  canvas.newId = function () {
    return "i" + (canvas.instanceCounter++);
  };

  canvas.reset = function () {
    canvas.state.stack = [];
    canvas.selectedId = null;
    canvas.emit();
  };

  canvas.loadFromPreset = function (presetId) {
    const preset = P.presets[presetId];
    if (!preset) return;
    const built = preset.build();
    canvas.state.card = Object.assign({}, built.card);
    canvas.state.stack = (built.stack || []).map(item => ({
      id: canvas.newId(),
      component: item.component,
      props: Object.assign({}, item.props || {}),
    }));
    canvas.selectedId = null;
    canvas.emit();
  };

  canvas.addComponent = function (componentId, insertIndex) {
    const def = P.components[componentId];
    if (!def) return;
    const id = canvas.newId();
    const instance = {
      id,
      component: componentId,
      props: Object.assign({}, def.defaults || {}),
    };
    const at = (insertIndex == null) ? canvas.state.stack.length : insertIndex;
    canvas.state.stack.splice(at, 0, instance);
    canvas.selectedId = id;
    canvas.emit();
  };

  canvas.removeInstance = function (id) {
    canvas.state.stack = canvas.state.stack.filter(x => x.id !== id);
    if (canvas.selectedId === id) canvas.selectedId = null;
    canvas.emit();
  };

  canvas.moveInstance = function (id, toIndex) {
    const idx = canvas.state.stack.findIndex(x => x.id === id);
    if (idx === -1) return;
    const [item] = canvas.state.stack.splice(idx, 1);
    let dest = toIndex;
    if (idx < toIndex) dest = toIndex - 1;
    dest = Math.max(0, Math.min(dest, canvas.state.stack.length));
    canvas.state.stack.splice(dest, 0, item);
    canvas.emit();
  };

  canvas.duplicateInstance = function (id) {
    const idx = canvas.state.stack.findIndex(x => x.id === id);
    if (idx === -1) return;
    const src = canvas.state.stack[idx];
    const copy = { id: canvas.newId(), component: src.component, props: Object.assign({}, src.props) };
    canvas.state.stack.splice(idx + 1, 0, copy);
    canvas.selectedId = copy.id;
    canvas.emit();
  };

  canvas.select = function (id) {
    canvas.selectedId = id;
    canvas.emit();
  };

  canvas.updateInstanceProps = function (id, partial) {
    const inst = canvas.state.stack.find(x => x.id === id);
    if (!inst) return;
    inst.props = Object.assign({}, inst.props, partial);
    canvas.emit();
  };

  canvas.updateCard = function (partial) {
    canvas.state.card = Object.assign({}, canvas.state.card, partial);
    canvas.emit();
  };

  // ---------- rendering ----------

  /**
   * Renders the design card. Includes drop zones between items + at
   * top/bottom, plus instance selection/toolbar UI.
   */
  canvas.renderDesignCard = function () {
    const { card, stack } = canvas.state;
    const variant = card.variant || "light";
    const lineColor = card.lineColor || "#3FA9B5";
    const cls = ["widget-card", variant !== "light" ? variant : ""].filter(Boolean).join(" ");

    if (stack.length === 0) {
      return `
        <div class="${cls}" style="--line-color:${lineColor};--accent:${lineColor};">
          <div class="canvas-empty"
               data-drop-index="0">
            Drop components here<br><span style="font-size:11px;opacity:0.7">or pick a preset to start from</span>
          </div>
        </div>
      `;
    }

    const items = stack.map((inst, i) => {
      const html = P.renderComponent(inst.component, inst.props);
      const selectedCls = inst.id === canvas.selectedId ? " selected" : "";
      return `
        <div class="drop-zone" data-drop-index="${i}">drop here</div>
        <div class="canvas-instance${selectedCls}" data-instance-id="${inst.id}" draggable="true">
          ${html}
          <div class="instance-toolbar">
            <button data-action="up" title="Move up">▲</button>
            <button data-action="down" title="Move down">▼</button>
            <button data-action="dup" title="Duplicate">⎘</button>
            <button class="danger" data-action="del" title="Delete">✕</button>
          </div>
        </div>
      `;
    }).join("");

    const lastDrop = `<div class="drop-zone" data-drop-index="${stack.length}">drop here</div>`;

    return `
      <div class="${cls} canvas-stack" style="--line-color:${lineColor};--accent:${lineColor};" id="canvasCard">
        ${items}
        ${lastDrop}
      </div>
    `;
  };

  canvas.exportShape = function () {
    return {
      card: Object.assign({}, canvas.state.card),
      stack: canvas.state.stack.map(x => ({ component: x.component, props: Object.assign({}, x.props) })),
    };
  };

})(window.Playground);
