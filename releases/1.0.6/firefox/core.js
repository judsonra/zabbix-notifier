// Generated from src/*.ts. Run npm run build; do not edit.
"use strict";
var Zabbix = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/core.ts
  var core_exports = {};
  __export(core_exports, {
    config: () => config,
    incident: () => incident,
    normalizeSeverities: () => normalizeSeverities
  });

  // src/i18n.ts
  function i18n() {
    const g = globalThis;
    return g.browser?.i18n ?? g.chrome?.i18n;
  }
  function t(key, ...substitutions) {
    return i18n()?.getMessage(key, substitutions.map(String)) || key;
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
  return __toCommonJS(core_exports);
})();
