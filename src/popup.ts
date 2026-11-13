import { mountIcons } from './icons';
import { config as normalizeConfig, incident, normalizeSeverities } from './core';
import { t, formatDate, severityName, uiLanguage } from './i18n';
import { api, readStorage, errorMessage } from './platform';
import type { Config, Controls, Message, Reply } from './types';

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error('Elemento não encontrado: ' + id);
  return node as T;
}
function setConnectionOpen(open: boolean): void {
  $('connection').hidden = !open;
  $('settings').setAttribute('aria-expanded', String(open));
}

function selectedSeverities(): number[] {
  return normalizeSeverities(Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="severity"]:checked'),
    input => Number(input.value)
  ));
}
function restoreSeverities(values?: number[]): void {
  const selected = new Set(normalizeSeverities(values));
  for (const input of document.querySelectorAll<HTMLInputElement>('input[name="severity"]')) {
    input.checked = selected.has(Number(input.value));
  }
}

mountIcons();
document.documentElement.lang = uiLanguage();
for (const node of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
  node.textContent = t(node.dataset.i18n ?? '', ...(node.dataset.i18nArg ? [node.dataset.i18nArg] : []));
}
for (const attr of ['title', 'aria-label']) {
  const dataKey = 'i18n' + attr.replace(/(^|-)(\w)/g, (_m, _d, c: string) => c.toUpperCase());
  for (const node of document.querySelectorAll<HTMLElement>(`[data-i18n-${attr}]`)) {
    node.setAttribute(attr, t(node.dataset[dataKey] ?? ''));
  }
}

let saved: Config | undefined;
let savedControls: Controls = {};
let toolbarBusy = false;
async function render() {
  const { config, state = {}, controls = {} } = await readStorage();
  saved = config;
  savedControls = controls;
  const paused = controls.paused === true;
  const muted = controls.muted === true;
  const monitoringLabel = t(paused ? 'monitoringStart' : 'monitoringStop');
  $('monitoring').title = monitoringLabel;
  $('monitoring').setAttribute('aria-label', monitoringLabel);
  $('monitoring').setAttribute('aria-pressed', String(!paused));
  $('play-icon').toggleAttribute('hidden', !paused);
  $('stop-icon').toggleAttribute('hidden', paused);
  const muteLabel = t(muted ? 'dndOff' : 'dndOn');
  $('mute').title = muteLabel;
  $('mute').setAttribute('aria-label', muteLabel);
  $('mute').setAttribute('aria-pressed', String(muted));
  $('bell-icon').toggleAttribute('hidden', muted);
  $('muted-icon').toggleAttribute('hidden', !muted);
  $('mode-status').textContent = !config ? '' :
    [t(paused ? 'modePaused' : 'modeActive'),
      ...(muted ? [t('dndActive')] : [])].join(' · ');
  for (const id of ['monitoring', 'refresh', 'mute']) $<HTMLButtonElement>(id).disabled = !config || toolbarBusy;
  $('count').textContent = String(state.rows?.length ?? 0);
  $('status').textContent = state.error ? t('statusFail', state.error) : state.checkedAt ? t('statusLast', formatDate(state.checkedAt)) : t('statusInitial');
  $<HTMLButtonElement>('disconnect').disabled = !config;
  $('problems').replaceChildren();
  if (!state.rows?.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = t(config ? 'emptyConfigured' : 'emptyUnconfigured');
    $('problems').append(empty);
  }
  for (const p of state.rows || []) {
    if (!config) break;
    const a = document.createElement('a');
    a.className = `problem severity-${p.severity}`;
    a.href = incident(config.url, p); a.target = '_blank'; a.rel = 'noopener noreferrer';
    const host = document.createElement('strong'); host.textContent = p.host || t('hostUnavailable');
    const name = document.createElement('span'); name.textContent = p.name;
    const detail = document.createElement('small');
    detail.textContent = `${severityName(Number(p.severity))} · ${formatDate(Number(p.clock) * 1000)} · ${t(p.acknowledged === '1' ? 'acked' : 'notAcked')}${p.suppressed === '1' ? ' · ' + t('suppressed') : ''}`;
    a.append(host, name, detail); $('problems').append(a);
  }
}
async function send(message: Message): Promise<void> {
  const reply: Reply | undefined = await api.runtime.sendMessage(message);
  if (!reply) throw new Error(t('errOpFailed'));
  if (!reply.ok) throw new Error(reply.error);
  await render();
}
$<HTMLFormElement>('form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  if (!(button instanceof HTMLButtonElement)) return;
  button.disabled = true;
  try {
    const config = normalizeConfig({ url: $<HTMLInputElement>('url').value, token: $<HTMLInputElement>('token').value, interval: $<HTMLSelectElement>('interval').value, showSuppressed: $<HTMLInputElement>('show-suppressed').checked, severities: selectedSeverities() });
    const granted = await api.permissions.request({ origins: [new URL(config.url).origin + '/*'] });
    if (!granted) throw new Error(t('errPermission'));
    $('status').textContent = t('testing');
    await send({ type: 'save', config });
    $<HTMLInputElement>('token').value = '';
    setConnectionOpen(false);
  } catch (error) { $('status').textContent = errorMessage(error); }
  finally { button.disabled = false; }
});
let filterRevision = 0;
async function autoSaveFilters(event: Event): Promise<void> {
  let severities: number[];
  try {
    severities = selectedSeverities();
  } catch (error) {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.name === 'severity') input.checked = true;
    $('filter-status').textContent = errorMessage(error);
    return;
  }
  if (!saved) {
    $('filter-status').textContent = t('filtersWillSave');
    return;
  }
  const revision = ++filterRevision;
  $('filter-status').textContent = t('savingFilters');
  try {
    const reply: Reply | undefined = await api.runtime.sendMessage({
      type: 'preferences',
      showSuppressed: $<HTMLInputElement>('show-suppressed').checked,
      severities
    } satisfies Message);
    if (!reply) throw new Error(t('errFiltersNoReply'));
    if (!reply.ok) throw new Error(reply.error);
    if (revision !== filterRevision) return;
    await render();
    $('filter-status').textContent = t('filtersSaved');
  } catch (error) {
    if (revision === filterRevision) {
      $('filter-status').textContent = t('filtersNotSaved', errorMessage(error));
    }
  }
}
for (const input of document.querySelectorAll<HTMLInputElement>('input[name="severity"], #show-suppressed')) {
  input.addEventListener('change', autoSaveFilters);
}
$('settings').addEventListener('click', () => {
  setConnectionOpen(Boolean($('connection').hidden));
});
async function toolbarAction(message: Message): Promise<void> {
  if (toolbarBusy || !saved) return;
  toolbarBusy = true;
  for (const id of ['monitoring', 'refresh', 'mute']) $<HTMLButtonElement>(id).disabled = true;
  try { await send(message); }
  catch (error) { $('status').textContent = errorMessage(error); }
  finally {
    toolbarBusy = false;
    for (const id of ['monitoring', 'refresh', 'mute']) $<HTMLButtonElement>(id).disabled = !saved;
  }
}
$('monitoring').addEventListener('click', () => toolbarAction({
  type: 'monitoring', paused: savedControls.paused !== true
}));
$('refresh').addEventListener('click', () => toolbarAction({ type: 'refresh' }));
$('mute').addEventListener('click', () => toolbarAction({
  type: 'mute', muted: savedControls.muted !== true
}));
$('disconnect').addEventListener('click', async () => {
  try {
    await send({ type: 'disconnect' });
    filterRevision++;
    $('filter-status').textContent = '';
    restoreSeverities();
    $<HTMLInputElement>('token').value = ''; $<HTMLInputElement>('url').value = ''; $<HTMLInputElement>('show-suppressed').checked = false; setConnectionOpen(true);
  } catch (e) { $('status').textContent = errorMessage(e); }
});
api.storage.onChanged.addListener((changes, area) => { if (area === 'local' && (changes.state || changes.config || changes.controls)) render(); });
render().then(() => {
  if (saved) { $<HTMLInputElement>('url').value = saved.url; $<HTMLSelectElement>('interval').value = String(saved.interval); }
  $<HTMLInputElement>('show-suppressed').checked = saved?.showSuppressed === true;
  restoreSeverities(saved?.severities);
  setConnectionOpen(!saved);
}).catch(e => { $('status').textContent = errorMessage(e); });
