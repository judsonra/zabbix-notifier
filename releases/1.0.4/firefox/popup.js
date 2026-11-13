// Generated from src/*.ts. Run npm run build; do not edit.
"use strict";
(() => {
  // node_modules/lucide/dist/esm/defaultAttributes.mjs
  var defaultAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  };

  // node_modules/lucide/dist/esm/createElement.mjs
  var createSVGElement = ([tag, attrs, children]) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs).forEach((name) => {
      element.setAttribute(name, String(attrs[name]));
    });
    if (children?.length) {
      children.forEach((child) => {
        const childElement = createSVGElement(child);
        element.appendChild(childElement);
      });
    }
    return element;
  };
  var createElement = (iconNode, customAttrs = {}) => {
    const tag = "svg";
    const attrs = {
      ...defaultAttributes,
      ...customAttrs
    };
    return createSVGElement([tag, attrs, iconNode]);
  };

  // node_modules/lucide/dist/esm/icons/bell-off.mjs
  var BellOff = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
    ["path", { d: "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742" }],
    ["path", { d: "m2 2 20 20" }],
    ["path", { d: "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05" }]
  ];

  // node_modules/lucide/dist/esm/icons/bell.mjs
  var Bell = [
    ["path", { d: "M10.268 21a2 2 0 0 0 3.464 0" }],
    [
      "path",
      {
        d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
      }
    ]
  ];

  // node_modules/lucide/dist/esm/icons/play.mjs
  var Play = [
    [
      "path",
      { d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" }
    ]
  ];

  // node_modules/lucide/dist/esm/icons/refresh-cw.mjs
  var RefreshCw = [
    ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }],
    ["path", { d: "M21 3v5h-5" }],
    ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }],
    ["path", { d: "M8 16H3v5" }]
  ];

  // node_modules/lucide/dist/esm/icons/settings.mjs
  var Settings = [
    [
      "path",
      {
        d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
      }
    ],
    ["circle", { cx: "12", cy: "12", r: "3" }]
  ];

  // node_modules/lucide/dist/esm/icons/square.mjs
  var Square = [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }]];

  // src/icons.ts
  var icons = {
    "play-icon": Play,
    "stop-icon": Square,
    "refresh-icon": RefreshCw,
    "bell-icon": Bell,
    "muted-icon": BellOff,
    "settings-icon": Settings
  };
  function mountIcons() {
    for (const [id, icon] of Object.entries(icons)) {
      const slot = document.getElementById(id);
      if (!slot) throw new Error("\xCDcone n\xE3o encontrado: " + id);
      slot.replaceChildren(createElement(icon, {
        width: "20",
        height: "20",
        "stroke-width": "2",
        "aria-hidden": "true",
        focusable: "false"
      }));
    }
  }

  // src/core.ts
  var severity = ["N\xE3o classificado", "Informa\xE7\xE3o", "Aten\xE7\xE3o", "M\xE9dia", "Alta", "Desastre"];
  function config(input) {
    if (!input || typeof input !== "object") throw new Error("Configura\xE7\xE3o inv\xE1lida.");
    const value = input;
    if (typeof value.url !== "string") throw new Error("Informe a URL do Zabbix.");
    if (typeof value.token !== "string" || !value.token.trim()) throw new Error("Informe o token de API.");
    const url = new URL(value.url.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      throw new Error("Informe uma URL HTTPS, sem credenciais, par\xE2metros ou fragmentos.");
    }
    const interval = Number(value.interval);
    if (interval !== 30 && interval !== 45 && interval !== 60) throw new Error("Intervalo inv\xE1lido.");
    url.pathname = url.pathname.replace(/\/(?:api_jsonrpc\.php|index\.php|zabbix\.php)\/?$/, "/").replace(/\/*$/, "/");
    return { url: url.href, token: value.token.trim(), interval, showSuppressed: value.showSuppressed === true, severities: normalizeSeverities(value.severities) };
  }
  function incident(base, problem) {
    if (!/^\d+$/.test(problem.eventid) || !/^\d+$/.test(problem.objectid)) throw new Error("Incidente inv\xE1lido.");
    const url = new URL("tr_events.php", base);
    url.searchParams.set("triggerid", problem.objectid);
    url.searchParams.set("eventid", problem.eventid);
    return url.href;
  }
  function normalizeSeverities(input) {
    if (input === void 0) return [0, 1, 2, 3, 4, 5];
    if (!Array.isArray(input) || !input.length || !input.every((n) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 5)) {
      throw new Error("Selecione pelo menos uma severidade v\xE1lida.");
    }
    return [...new Set(input)].sort((a, b) => a - b);
  }

  // src/platform.ts
  var extensionGlobal = globalThis;
  var api = extensionGlobal.browser ?? chrome;
  async function readStorage() {
    return await api.storage.local.get(["config", "state", "controls"]);
  }
  function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  // src/popup.ts
  function $(id) {
    const node = document.getElementById(id);
    if (!node) throw new Error("Elemento n\xE3o encontrado: " + id);
    return node;
  }
  function setConnectionOpen(open) {
    $("connection").hidden = !open;
    $("settings").setAttribute("aria-expanded", String(open));
  }
  function selectedSeverities() {
    return normalizeSeverities(Array.from(
      document.querySelectorAll('input[name="severity"]:checked'),
      (input) => Number(input.value)
    ));
  }
  function restoreSeverities(values) {
    const selected = new Set(normalizeSeverities(values));
    for (const input of document.querySelectorAll('input[name="severity"]')) {
      input.checked = selected.has(Number(input.value));
    }
  }
  mountIcons();
  var saved;
  var savedControls = {};
  var toolbarBusy = false;
  async function render() {
    const { config: config2, state = {}, controls = {} } = await readStorage();
    saved = config2;
    savedControls = controls;
    const paused = controls.paused === true;
    const muted = controls.muted === true;
    const monitoringLabel = paused ? "Iniciar verifica\xE7\xF5es autom\xE1ticas" : "Parar verifica\xE7\xF5es autom\xE1ticas";
    $("monitoring").title = monitoringLabel;
    $("monitoring").setAttribute("aria-label", monitoringLabel);
    $("monitoring").setAttribute("aria-pressed", String(!paused));
    $("play-icon").toggleAttribute("hidden", !paused);
    $("stop-icon").toggleAttribute("hidden", paused);
    const muteLabel = muted ? "Desativar n\xE3o perturbe" : "Ativar n\xE3o perturbe";
    $("mute").title = muteLabel;
    $("mute").setAttribute("aria-label", muteLabel);
    $("mute").setAttribute("aria-pressed", String(muted));
    $("bell-icon").toggleAttribute("hidden", muted);
    $("muted-icon").toggleAttribute("hidden", !muted);
    $("mode-status").textContent = !config2 ? "" : [
      paused ? "Verifica\xE7\xF5es autom\xE1ticas pausadas" : "Verifica\xE7\xF5es autom\xE1ticas ativas",
      ...muted ? ["N\xE3o perturbe ativo"] : []
    ].join(" \xB7 ");
    for (const id of ["monitoring", "refresh", "mute"]) $(id).disabled = !config2 || toolbarBusy;
    $("count").textContent = String(state.rows?.length ?? 0);
    $("status").textContent = state.error ? `Falha na consulta: ${state.error}. A lista pode estar desatualizada.` : state.checkedAt ? `\xDAltima consulta: ${new Date(state.checkedAt).toLocaleString("pt-BR")}` : "Configure sua conex\xE3o para come\xE7ar.";
    $("disconnect").disabled = !config2;
    $("save-preferences").disabled = !config2;
    $("problems").replaceChildren();
    if (!state.rows?.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = config2 ? "Nenhum problema ativo na \xFAltima consulta." : "Seus alarmes aparecer\xE3o aqui.";
      $("problems").append(empty);
    }
    for (const p of state.rows || []) {
      if (!config2) break;
      const a = document.createElement("a");
      a.className = `problem severity-${p.severity}`;
      a.href = incident(config2.url, p);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const host = document.createElement("strong");
      host.textContent = p.host || "Host indispon\xEDvel";
      const name = document.createElement("span");
      name.textContent = p.name;
      const detail = document.createElement("small");
      detail.textContent = `${severity[Number(p.severity)]} \xB7 ${new Date(Number(p.clock) * 1e3).toLocaleString("pt-BR")} \xB7 ${p.acknowledged === "1" ? "Reconhecido" : "N\xE3o reconhecido"}${p.suppressed === "1" ? " \xB7 Suprimido" : ""}`;
      a.append(host, name, detail);
      $("problems").append(a);
    }
  }
  async function send(message) {
    const reply = await api.runtime.sendMessage(message);
    if (!reply) throw new Error("N\xE3o foi poss\xEDvel executar a opera\xE7\xE3o.");
    if (!reply.ok) throw new Error(reply.error);
    await render();
  }
  $("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = true;
    try {
      const config2 = config({ url: $("url").value, token: $("token").value, interval: $("interval").value, showSuppressed: $("show-suppressed").checked, severities: selectedSeverities() });
      const granted = await api.permissions.request({ origins: [new URL(config2.url).origin + "/*"] });
      if (!granted) throw new Error("Permiss\xE3o de acesso ao Zabbix n\xE3o concedida.");
      $("status").textContent = "Testando conex\xE3o\u2026";
      await send({ type: "save", config: config2 });
      $("token").value = "";
      setConnectionOpen(false);
    } catch (error) {
      $("status").textContent = errorMessage(error);
    } finally {
      button.disabled = false;
    }
  });
  $("save-preferences").addEventListener("click", async () => {
    const button = $("save-preferences");
    button.disabled = true;
    try {
      await send({ type: "preferences", showSuppressed: $("show-suppressed").checked, severities: selectedSeverities() });
      setConnectionOpen(false);
    } catch (error) {
      $("status").textContent = errorMessage(error);
    } finally {
      button.disabled = !saved;
    }
  });
  $("settings").addEventListener("click", () => {
    setConnectionOpen(Boolean($("connection").hidden));
  });
  async function toolbarAction(message) {
    if (toolbarBusy || !saved) return;
    toolbarBusy = true;
    for (const id of ["monitoring", "refresh", "mute"]) $(id).disabled = true;
    try {
      await send(message);
    } catch (error) {
      $("status").textContent = errorMessage(error);
    } finally {
      toolbarBusy = false;
      for (const id of ["monitoring", "refresh", "mute"]) $(id).disabled = !saved;
    }
  }
  $("monitoring").addEventListener("click", () => toolbarAction({
    type: "monitoring",
    paused: savedControls.paused !== true
  }));
  $("refresh").addEventListener("click", () => toolbarAction({ type: "refresh" }));
  $("mute").addEventListener("click", () => toolbarAction({
    type: "mute",
    muted: savedControls.muted !== true
  }));
  $("disconnect").addEventListener("click", async () => {
    try {
      await send({ type: "disconnect" });
      restoreSeverities();
      $("token").value = "";
      $("url").value = "";
      $("show-suppressed").checked = false;
      setConnectionOpen(true);
    } catch (e) {
      $("status").textContent = errorMessage(e);
    }
  });
  api.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.state || changes.config || changes.controls)) render();
  });
  render().then(() => {
    if (saved) {
      $("url").value = saved.url;
      $("interval").value = String(saved.interval);
    }
    $("show-suppressed").checked = saved?.showSuppressed === true;
    restoreSeverities(saved?.severities);
    setConnectionOpen(!saved);
  }).catch((e) => {
    $("status").textContent = errorMessage(e);
  });
})();
