if (typeof importScripts === 'function') importScripts('core.js');
const api = globalThis.browser || chrome;
const ALARM = 'zabbix-poll';
let operation = Promise.resolve();
function serial(fn) {
  const result = operation.then(fn, fn);
  operation = result.catch(() => {});
  return result;
}
async function rpc(config, method, params) {
  const response = await fetch(new URL('api_jsonrpc.php', config.url), {
    method: 'POST', credentials: 'omit', redirect: 'error',
    headers: { 'Content-Type': 'application/json-rpc', Authorization: `Bearer ${config.token}` },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`Zabbix respondeu HTTP ${response.status}.`);
  let data;
  try { data = await response.json(); } catch { throw new Error('Resposta inválida. Confira a URL e o acesso à API.'); }
  if (data.error) throw new Error(`API Zabbix: ${data.error.message} ${data.error.data || ''}`);
  if (!Array.isArray(data.result)) throw new Error('Resposta inesperada da API.');
  return data.result;
}
async function problems(config) {
  const rows = await rpc(config, 'problem.get', {
    output: ['eventid', 'objectid', 'name', 'severity', 'clock', 'acknowledged', 'suppressed'],
    ...(config.showSuppressed === true ? {} : { suppressed: false }),
    source: 0, object: 0, recent: false, sortfield: ['eventid'], sortorder: 'DESC'
  });
  if (!rows.length) return [];
  const triggers = await rpc(config, 'trigger.get', {
    output: ['triggerid'], triggerids: [...new Set(rows.map(p => p.objectid))],
    selectHosts: ['name']
  });
  const hosts = new Map(triggers.map(t => [t.triggerid, t.hosts.map(h => h.name).join(', ')]));
  return rows.map(p => ({ ...p, host: hosts.get(p.objectid) || 'Host indisponível' }));
}
async function badge(text, color) {
  await api.action.setBadgeText({ text });
  await api.action.setBadgeBackgroundColor({ color });
}
async function poll() {
  const { config, state = {} } = await api.storage.local.get(['config', 'state']);
  if (!config) return;
  try {
    const rows = await problems(config);
    const previous = new Set(state.seen || []);
    const fresh = state.initialized ? rows.filter(p => !previous.has(p.eventid)) : [];
    // Store notification links before displaying them, including across worker restarts.
    const links = Object.fromEntries(Object.entries(state.links || {}).slice(-100));
    for (const p of fresh) links[`event-${p.eventid}`] = Zabbix.incident(config.url, p);
    await api.storage.local.set({ state: {
      rows, seen: rows.map(p => p.eventid), initialized: true, links,
      checkedAt: Date.now(), error: ''
    } });
    await badge(rows.length ? String(rows.length) : '', '#c62828');
    // A single summary avoids flooding the OS when many events arrive together.
    if (fresh.length) {
      const p = fresh[0];
      await api.notifications.create(`event-${p.eventid}`, {
        type: 'basic', iconUrl: api.runtime.getURL('icon.png'),
        title: fresh.length === 1 ? `${Zabbix.severity[Number(p.severity)]}: ${p.host}` : `${fresh.length} novos problemas no Zabbix`,
        message: fresh.length === 1 ? p.name : `${p.host}: ${p.name}\nAbra a extensão para ver todos.`
      });
    }
  } catch (error) {
    await api.storage.local.set({ state: { ...state, error: String(error.message), attemptedAt: Date.now() } });
    await badge('!', '#ad6800');
  }
}
async function schedule() {
  const { config } = await api.storage.local.get('config');
  await api.alarms.clear(ALARM);
  if (config) await api.alarms.create(ALARM, { periodInMinutes: config.interval / 60 });
}
api.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM) serial(poll);
});
api.runtime.onInstalled.addListener(() => serial(async () => {
  if (api.storage.local.setAccessLevel) await api.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await schedule(); await poll();
}));
api.runtime.onStartup.addListener(() => serial(async () => { await schedule(); await poll(); }));
api.notifications.onClicked.addListener(id => serial(async () => {
  const { state } = await api.storage.local.get('state');
  const url = state?.links?.[id];
  if (url) await api.tabs.create({ url });
}));
api.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== api.runtime.id) return;
  serial(async () => {
    if (message.type === 'save') {
      const config = Zabbix.config(message.config);
      const allowed = await api.permissions.contains({ origins: [new URL(config.url).origin + '/*'] });
      if (!allowed) throw new Error('Autorize o acesso ao servidor Zabbix.');
      await problems(config); // Validate credentials before replacing a working connection.
      await api.storage.local.set({ config, state: {} });
      await schedule(); await poll();
    } else if (message.type === 'preferences') {
      if (typeof message.showSuppressed !== 'boolean') throw new Error('Preferência inválida.');
      const { config, state = {} } = await api.storage.local.get(['config', 'state']);
      if (!config) throw new Error('Configure sua conexão primeiro.');
      await api.storage.local.set({
        config: { ...config, showSuppressed: message.showSuppressed },
        // Changing the filter establishes a silent baseline, preserving old notification links.
        state: { ...state, initialized: false }
      });
      await poll();
    } else if (message.type === 'refresh') {
      await poll();
    } else if (message.type === 'disconnect') {
      await api.alarms.clear(ALARM);
      await api.storage.local.remove(['config', 'state']);
      await badge('', '#c62828');
    } else throw new Error('Operação desconhecida.');
    return { ok: true };
  }).then(respond, error => respond({ ok: false, error: error.message }));
  return true;
});
