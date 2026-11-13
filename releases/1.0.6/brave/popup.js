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

  // src/i18n.ts
  function i18n() {
    const g = globalThis;
    return g.browser?.i18n ?? g.chrome?.i18n;
  }
  function t(key, ...substitutions) {
    return i18n()?.getMessage(key, substitutions.map(String)) || key;
  }
  function uiLanguage() {
    return i18n()?.getUILanguage() || "pt-BR";
  }
  function formatDate(value) {
    return new Date(value).toLocaleString(uiLanguage());
  }
  function severityName(level) {
    return t(`sev${level}`);
  }

  // src/core.ts
  function config(input) {
    if (!input || typeof input !== "object") throw new Error(t("errConfigInvalid"));
    const value = input;
    if (typeof value.url !== "string") throw new Error(t("errEnterUrl"));
    if (typeof value.token !== "string" || !value.token.trim()) throw new Error(t("errEnterToken"));
    const url = new URL(value.url.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      throw new Error(t("errUrlRule"));
    }
    const interval = Number(value.interval);
    if (interval !== 30 && interval !== 45 && interval !== 60) throw new Error(t("errInterval"));
    url.pathname = url.pathname.replace(/\/(?:api_jsonrpc\.php|index\.php|zabbix\.php)\/?$/, "/").replace(/\/*$/, "/");
    return { url: url.href, token: value.token.trim(), interval, showSuppressed: value.showSuppressed === true, severities: normalizeSeverities(value.severities) };
  }
  function incident(base, problem) {
    if (!/^\d+$/.test(problem.eventid) || !/^\d+$/.test(problem.objectid)) throw new Error(t("errIncident"));
    const url = new URL("tr_events.php", base);
    url.searchParams.set("triggerid", problem.objectid);
    url.searchParams.set("eventid", problem.eventid);
    return url.href;
  }
  function normalizeSeverities(input) {
    if (input === void 0) return [0, 1, 2, 3, 4, 5];
    if (!Array.isArray(input) || !input.length || !input.every((n) => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 5)) {
      throw new Error(t("errSeverities"));
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
  document.documentElement.lang = uiLanguage();
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n ?? "", ...node.dataset.i18nArg ? [node.dataset.i18nArg] : []);
  }
  for (const attr of ["title", "aria-label"]) {
    const dataKey = "i18n" + attr.replace(/(^|-)(\w)/g, (_m, _d, c) => c.toUpperCase());
    for (const node of document.querySelectorAll(`[data-i18n-${attr}]`)) {
      node.setAttribute(attr, t(node.dataset[dataKey] ?? ""));
    }
  }
  var saved;
  var savedControls = {};
  var toolbarBusy = false;
  async function render() {
    const { config: config2, state = {}, controls = {} } = await readStorage();
    saved = config2;
    savedControls = controls;
    const paused = controls.paused === true;
    const muted = controls.muted === true;
    const monitoringLabel = t(paused ? "monitoringStart" : "monitoringStop");
    $("monitoring").title = monitoringLabel;
    $("monitoring").setAttribute("aria-label", monitoringLabel);
    $("monitoring").setAttribute("aria-pressed", String(!paused));
    $("play-icon").toggleAttribute("hidden", !paused);
    $("stop-icon").toggleAttribute("hidden", paused);
    const muteLabel = t(muted ? "dndOff" : "dndOn");
    $("mute").title = muteLabel;
    $("mute").setAttribute("aria-label", muteLabel);
    $("mute").setAttribute("aria-pressed", String(muted));
    $("bell-icon").toggleAttribute("hidden", muted);
    $("muted-icon").toggleAttribute("hidden", !muted);
    $("mode-status").textContent = !config2 ? "" : [
      t(paused ? "modePaused" : "modeActive"),
      ...muted ? [t("dndActive")] : []
    ].join(" \xB7 ");
    for (const id of ["monitoring", "refresh", "mute"]) $(id).disabled = !config2 || toolbarBusy;
    $("count").textContent = String(state.rows?.length ?? 0);
    $("status").textContent = state.error ? t("statusFail", state.error) : state.checkedAt ? t("statusLast", formatDate(state.checkedAt)) : t("statusInitial");
    $("disconnect").disabled = !config2;
    $("problems").replaceChildren();
    if (!state.rows?.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = t(config2 ? "emptyConfigured" : "emptyUnconfigured");
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
      host.textContent = p.host || t("hostUnavailable");
      const name = document.createElement("span");
      name.textContent = p.name;
      const detail = document.createElement("small");
      detail.textContent = `${severityName(Number(p.severity))} \xB7 ${formatDate(Number(p.clock) * 1e3)} \xB7 ${t(p.acknowledged === "1" ? "acked" : "notAcked")}${p.suppressed === "1" ? " \xB7 " + t("suppressed") : ""}`;
      a.append(host, name, detail);
      $("problems").append(a);
    }
  }
  async function send(message) {
    const reply = await api.runtime.sendMessage(message);
    if (!reply) throw new Error(t("errOpFailed"));
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
      if (!granted) throw new Error(t("errPermission"));
      $("status").textContent = t("testing");
      await send({ type: "save", config: config2 });
      $("token").value = "";
      setConnectionOpen(false);
    } catch (error) {
      $("status").textContent = errorMessage(error);
    } finally {
      button.disabled = false;
    }
  });
  var filterRevision = 0;
  async function autoSaveFilters(event) {
    let severities;
    try {
      severities = selectedSeverities();
    } catch (error) {
      const input = event.target;
      if (input instanceof HTMLInputElement && input.name === "severity") input.checked = true;
      $("filter-status").textContent = errorMessage(error);
      return;
    }
    if (!saved) {
      $("filter-status").textContent = t("filtersWillSave");
      return;
    }
    const revision = ++filterRevision;
    $("filter-status").textContent = t("savingFilters");
    try {
      const reply = await api.runtime.sendMessage({
        type: "preferences",
        showSuppressed: $("show-suppressed").checked,
        severities
      });
      if (!reply) throw new Error(t("errFiltersNoReply"));
      if (!reply.ok) throw new Error(reply.error);
      if (revision !== filterRevision) return;
      await render();
      $("filter-status").textContent = t("filtersSaved");
    } catch (error) {
      if (revision === filterRevision) {
        $("filter-status").textContent = t("filtersNotSaved", errorMessage(error));
      }
    }
  }
  for (const input of document.querySelectorAll('input[name="severity"], #show-suppressed')) {
    input.addEventListener("change", autoSaveFilters);
  }
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
      filterRevision++;
      $("filter-status").textContent = "";
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
