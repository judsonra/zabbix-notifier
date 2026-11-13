// Generated from src/*.ts. Run npm run build; do not edit.
"use strict";
(() => {
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
    return { url: url.href, token: value.token.trim(), interval, showSuppressed: value.showSuppressed === true };
  }
  function incident(base, problem) {
    if (!/^\d+$/.test(problem.eventid) || !/^\d+$/.test(problem.objectid)) throw new Error("Incidente inv\xE1lido.");
    const url = new URL("tr_events.php", base);
    url.searchParams.set("triggerid", problem.objectid);
    url.searchParams.set("eventid", problem.eventid);
    return url.href;
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
      const config2 = config({ url: $("url").value, token: $("token").value, interval: $("interval").value, showSuppressed: $("show-suppressed").checked });
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
      await send({ type: "preferences", showSuppressed: $("show-suppressed").checked });
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
    setConnectionOpen(!saved);
  }).catch((e) => {
    $("status").textContent = errorMessage(e);
  });
})();
