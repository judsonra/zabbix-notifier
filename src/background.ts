import { config as normalizeConfig, incident, normalizeSeverities } from './core';
import { api, readStorage, writeStorage, errorMessage } from './platform';
import { t, severityName } from './i18n';
import type { Config, Problem, Trigger, Reply } from './types';
const ALARM = 'zabbix-poll';
let operation: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const result = operation.then(fn, fn);
  operation = result.catch(() => {});
  return result;
}
async function rpc<T>(config: Config, method: string, params: Record<string, unknown>): Promise<T[]> {
  const response = await fetch(new URL('api_jsonrpc.php', config.url), {
    method: 'POST', credentials: 'omit', redirect: 'error',
    headers: { 'Content-Type': 'application/json-rpc', Authorization: `Bearer ${config.token}` },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(t('errHttp', response.status));
  let data: { result?: unknown; error?: { message: string; data?: string } };
  try { data = await response.json(); } catch { throw new Error(t('errInvalidResponse')); }
  if (data.error) throw new Error(t('errApi', data.error.message, data.error.data || ''));
  if (!Array.isArray(data.result)) throw new Error(t('errUnexpected'));
  return data.result as T[];
}
async function problems(config: Config): Promise<Problem[]> {
  const rows = await rpc<Problem>(config, 'problem.get', {
    output: ['eventid', 'objectid', 'name', 'severity', 'clock', 'acknowledged', 'suppressed'],
    ...(config.showSuppressed === true ? {} : { suppressed: false }),
    severities: normalizeSeverities(config.severities),
    source: 0, object: 0, recent: false, sortfield: ['eventid'], sortorder: 'DESC'
  });
  if (!rows.length) return [];
  const triggers = await rpc<Trigger>(config, 'trigger.get', {
    output: ['triggerid'], triggerids: [...new Set(rows.map(p => p.objectid))],
    selectHosts: ['name']
  });
  const hosts = new Map(triggers.map(t => [t.triggerid, t.hosts.map(h => h.name).join(', ')]));
  return rows.map(p => ({ ...p, host: hosts.get(p.objectid) || t('hostUnavailable') }));
}
async function badge(text: string, color: string): Promise<void> {
  await api.action.setBadgeText({ text });
  await api.action.setBadgeBackgroundColor({ color });
}
async function poll({ manual = false, silent = false } = {}) {
  const { config, state = {}, controls = {} } = await readStorage();
  if (!config || (controls.paused === true && !manual)) return;
  try {
    const rows = await problems(config);
    const previous = new Set(state.seen || []);
    const fresh = state.initialized ? rows.filter(p => !previous.has(p.eventid)) : [];
    // Store notification links before displaying them, including across worker restarts.
    const links = Object.fromEntries(Object.entries(state.links || {}).slice(-100));
    for (const p of fresh) links[`event-${p.eventid}`] = incident(config.url, p);
    await writeStorage({ state: {
      rows, seen: rows.map(p => p.eventid), initialized: true, links,
      checkedAt: Date.now(), error: ''
    } });
    await badge(rows.length ? String(rows.length) : '', '#c62828');
    // A single summary avoids flooding the OS when many events arrive together.
    const p = fresh[0];
    if (p && controls.muted !== true && !silent) {
      await api.notifications.create(`event-${p.eventid}`, {
        type: 'basic', iconUrl: api.runtime.getURL('icon.png'),
        title: fresh.length === 1 ? t('notifSingle', severityName(Number(p.severity)), p.host ?? '') : t('notifManyTitle', fresh.length),
        message: fresh.length === 1 ? p.name : t('notifManyBody', p.host ?? '', p.name)
      });
    }
  } catch (error) {
    await writeStorage({ state: { ...state, error: errorMessage(error), attemptedAt: Date.now() } });
    await badge('!', '#ad6800');
  }
}
async function schedule() {
  const { config, controls = {} } = await readStorage();
  await api.alarms.clear(ALARM);
  if (config && controls.paused !== true) await api.alarms.create(ALARM, { periodInMinutes: config.interval / 60 });
}
api.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM) return serial(poll);
});
api.runtime.onInstalled.addListener(() => serial(async () => {
  if (api.storage.local.setAccessLevel) await api.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });
  await schedule(); await poll();
}));
api.runtime.onStartup.addListener(() => serial(async () => { await schedule(); await poll(); }));
api.notifications.onClicked.addListener(id => serial(async () => {
  const { state } = await readStorage();
  const url = state?.links?.[id];
  if (url) await api.tabs.create({ url });
}));
async function handleMessage(message: unknown): Promise<Reply> {
  if (!message || typeof message !== 'object') throw new Error(t('errInvalidMessage'));
  const request = message as Record<string, unknown>;
  if (request.type === 'save') {
    const config = normalizeConfig(request.config);
    const allowed = await api.permissions.contains({ origins: [new URL(config.url).origin + '/*'] });
    if (!allowed) throw new Error(t('errAuthorize'));
    await problems(config); // Validate credentials before replacing a working connection.
    await writeStorage({ config, state: {} });
    await schedule(); await poll({ manual: true, silent: true });
  } else if (request.type === 'preferences') {
    if (typeof request.showSuppressed !== 'boolean') throw new Error(t('errInvalidPref'));
    const { config, state = {} } = await readStorage();
    if (!config) throw new Error(t('errConfigFirst'));
    const severities = request.severities === undefined ? {} : { severities: normalizeSeverities(request.severities) };
    await writeStorage({
      config: { ...config, showSuppressed: request.showSuppressed, ...severities },
      // Changing the filter establishes a silent baseline, preserving old notification links.
      state: { ...state, initialized: false }
    });
    await poll({ manual: true, silent: true });
  } else if (request.type === 'monitoring' || request.type === 'mute') {
    const key = request.type === 'monitoring' ? 'paused' : 'muted';
    const value = request[key];
    if (typeof value !== 'boolean') throw new Error(t('errInvalidControl'));
    const { config, controls = {} } = await readStorage();
    if (!config) throw new Error(t('errConfigFirst'));
    await writeStorage({ controls: { ...controls, [key]: value } });
    if (request.type === 'monitoring') {
      await schedule();
      // Resuming establishes the current list without a backlog of notifications.
      if (!request.paused) await poll({ silent: true });
    }
  } else if (request.type === 'refresh') {
    await poll({ manual: true });
  } else if (request.type === 'disconnect') {
    await api.alarms.clear(ALARM);
    await api.storage.local.remove(['config', 'state']);
    await badge('', '#c62828');
  } else throw new Error(t('errUnknownOp'));
  return { ok: true };
}
api.runtime.onMessage.addListener((message: unknown, sender, respond) => {
  if (sender.id !== api.runtime.id) return;
  serial(() => handleMessage(message)).then(respond, error =>
    respond({ ok: false, error: errorMessage(error) }));
  return true;
});
