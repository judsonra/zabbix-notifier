// Generated from src/*.ts. Run npm run build; do not edit.
"use strict";
(() => {
  // src/i18n.ts
  function i18n() {
    const g = globalThis;
    return g.browser?.i18n ?? g.chrome?.i18n;
  }
  function t(key, ...substitutions) {
    return i18n()?.getMessage(key, substitutions.map(String)) || key;
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
  async function writeStorage(data) {
    await api.storage.local.set(data);
  }
  function errorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  // src/background.ts
  var ALARM = "zabbix-poll";
  var operation = Promise.resolve();
  function serial(fn) {
    const result = operation.then(fn, fn);
    operation = result.catch(() => {
    });
    return result;
  }
  async function rpc(config2, method, params) {
    const response = await fetch(new URL("api_jsonrpc.php", config2.url), {
      method: "POST",
      credentials: "omit",
      redirect: "error",
      headers: { "Content-Type": "application/json-rpc", Authorization: `Bearer ${config2.token}` },
      body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
      signal: AbortSignal.timeout(2e4)
    });
    if (!response.ok) throw new Error(t("errHttp", response.status));
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(t("errInvalidResponse"));
    }
    if (data.error) throw new Error(t("errApi", data.error.message, data.error.data || ""));
    if (!Array.isArray(data.result)) throw new Error(t("errUnexpected"));
    return data.result;
  }
  async function problems(config2) {
    const rows = await rpc(config2, "problem.get", {
      output: ["eventid", "objectid", "name", "severity", "clock", "acknowledged", "suppressed"],
      ...config2.showSuppressed === true ? {} : { suppressed: false },
      severities: normalizeSeverities(config2.severities),
      source: 0,
      object: 0,
      recent: false,
      sortfield: ["eventid"],
      sortorder: "DESC"
    });
    if (!rows.length) return [];
    const triggers = await rpc(config2, "trigger.get", {
      output: ["triggerid"],
      triggerids: [...new Set(rows.map((p) => p.objectid))],
      selectHosts: ["name"]
    });
    const hosts = new Map(triggers.map((t2) => [t2.triggerid, t2.hosts.map((h) => h.name).join(", ")]));
    return rows.map((p) => ({ ...p, host: hosts.get(p.objectid) || t("hostUnavailable") }));
  }
  async function badge(text, color) {
    await api.action.setBadgeText({ text });
    await api.action.setBadgeBackgroundColor({ color });
  }
  async function poll({ manual = false, silent = false } = {}) {
    const { config: config2, state = {}, controls = {} } = await readStorage();
    if (!config2 || controls.paused === true && !manual) return;
    try {
      const rows = await problems(config2);
      const previous = new Set(state.seen || []);
      const fresh = state.initialized ? rows.filter((p2) => !previous.has(p2.eventid)) : [];
      const links = Object.fromEntries(Object.entries(state.links || {}).slice(-100));
      for (const p2 of fresh) links[`event-${p2.eventid}`] = incident(config2.url, p2);
      await writeStorage({ state: {
        rows,
        seen: rows.map((p2) => p2.eventid),
        initialized: true,
        links,
        checkedAt: Date.now(),
        error: ""
      } });
      await badge(rows.length ? String(rows.length) : "", "#c62828");
      const p = fresh[0];
      if (p && controls.muted !== true && !silent) {
        await api.notifications.create(`event-${p.eventid}`, {
          type: "basic",
          iconUrl: api.runtime.getURL("icon.png"),
          title: fresh.length === 1 ? t("notifSingle", severityName(Number(p.severity)), p.host ?? "") : t("notifManyTitle", fresh.length),
          message: fresh.length === 1 ? p.name : t("notifManyBody", p.host ?? "", p.name)
        });
      }
    } catch (error) {
      await writeStorage({ state: { ...state, error: errorMessage(error), attemptedAt: Date.now() } });
      await badge("!", "#ad6800");
    }
  }
  async function schedule() {
    const { config: config2, controls = {} } = await readStorage();
    await api.alarms.clear(ALARM);
    if (config2 && controls.paused !== true) await api.alarms.create(ALARM, { periodInMinutes: config2.interval / 60 });
  }
  api.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM) return serial(poll);
  });
  api.runtime.onInstalled.addListener(() => serial(async () => {
    if (api.storage.local.setAccessLevel) await api.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" });
    await schedule();
    await poll();
  }));
  api.runtime.onStartup.addListener(() => serial(async () => {
    await schedule();
    await poll();
  }));
  api.notifications.onClicked.addListener((id) => serial(async () => {
    const { state } = await readStorage();
    const url = state?.links?.[id];
    if (url) await api.tabs.create({ url });
  }));
  async function handleMessage(message) {
    if (!message || typeof message !== "object") throw new Error(t("errInvalidMessage"));
    const request = message;
    if (request.type === "save") {
      const config2 = config(request.config);
      const allowed = await api.permissions.contains({ origins: [new URL(config2.url).origin + "/*"] });
      if (!allowed) throw new Error(t("errAuthorize"));
      await problems(config2);
      await writeStorage({ config: config2, state: {} });
      await schedule();
      await poll({ manual: true, silent: true });
    } else if (request.type === "preferences") {
      if (typeof request.showSuppressed !== "boolean") throw new Error(t("errInvalidPref"));
      const { config: config2, state = {} } = await readStorage();
      if (!config2) throw new Error(t("errConfigFirst"));
      const severities = request.severities === void 0 ? {} : { severities: normalizeSeverities(request.severities) };
      await writeStorage({
        config: { ...config2, showSuppressed: request.showSuppressed, ...severities },
        // Changing the filter establishes a silent baseline, preserving old notification links.
        state: { ...state, initialized: false }
      });
      await poll({ manual: true, silent: true });
    } else if (request.type === "monitoring" || request.type === "mute") {
      const key = request.type === "monitoring" ? "paused" : "muted";
      const value = request[key];
      if (typeof value !== "boolean") throw new Error(t("errInvalidControl"));
      const { config: config2, controls = {} } = await readStorage();
      if (!config2) throw new Error(t("errConfigFirst"));
      await writeStorage({ controls: { ...controls, [key]: value } });
      if (request.type === "monitoring") {
        await schedule();
        if (!request.paused) await poll({ silent: true });
      }
    } else if (request.type === "refresh") {
      await poll({ manual: true });
    } else if (request.type === "disconnect") {
      await api.alarms.clear(ALARM);
      await api.storage.local.remove(["config", "state"]);
      await badge("", "#c62828");
    } else throw new Error(t("errUnknownOp"));
    return { ok: true };
  }
  api.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== api.runtime.id) return;
    serial(() => handleMessage(message)).then(respond, (error) => respond({ ok: false, error: errorMessage(error) }));
    return true;
  });
})();
