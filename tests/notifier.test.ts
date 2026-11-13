import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as Zabbix from '../src/core';
import type { Config, Message, Problem, Reply, StoredData } from '../src/types';

const base: Config = { url: 'https://example.test/', token: 'test-token', interval: 30 };
type EventCallback = () => unknown;
type AlarmCallback = (alarm: { name: string }) => unknown;
type MessageCallback = (message: unknown, sender: { id?: string }, respond: (reply: Reply) => void) => unknown;
interface Fixture {
  store: StoredData;
  rows: Problem[];
  notices: [string, { message: string; title: string }][];
  badges: string[];
  requests: { method: string; params: Record<string, unknown> }[];
  alarmCreates: { name: string; periodInMinutes: number }[];
  alarmClears: string[];
  fail: boolean;
  poll(): Promise<void>;
  startup(): Promise<void>;
  installed(): Promise<void>;
  send(message: Message | Record<string, unknown>): Promise<Reply>;
}
function fixture(initial: StoredData = { config: base }): Fixture {
  const store = structuredClone(initial);
  let onMessage: MessageCallback | undefined;
  let onAlarm: AlarmCallback | undefined;
  let onStartup: EventCallback | undefined;
  let onInstalled: EventCallback | undefined;
  const f: Fixture = {
    store, rows: [], notices: [], badges: [], requests: [], alarmCreates: [], alarmClears: [], fail: false,
    async poll() { await onAlarm?.({ name: 'zabbix-poll' }); },
    async startup() { await onStartup?.(); },
    async installed() { await onInstalled?.(); },
    send(message) {
      return new Promise((resolve, reject) => {
        if (!onMessage) return reject(new Error('Listener não registrado.'));
        onMessage(message, { id: 'test-extension' }, resolve);
      });
    }
  };
  const api = {
    storage: {
      local: {
        async get() { return structuredClone(store); },
        async set(data: Partial<StoredData>) { Object.assign(store, structuredClone(data)); },
        async remove(keys: (keyof StoredData)[]) { for (const key of keys) delete store[key]; }
      }
    },
    permissions: { async contains() { return true; } },
    action: {
      async setBadgeText({ text }: { text: string }) { f.badges.push(text); },
      async setBadgeBackgroundColor() {}
    },
    notifications: {
      async create(id: string, notice: { message: string; title: string }) { f.notices.push([id, notice]); },
      onClicked: { addListener() {} }
    },
    tabs: { async create() {} },
    runtime: {
      id: 'test-extension', getURL: (url: string) => url,
      onInstalled: { addListener(fn: EventCallback) { onInstalled = fn; } },
      onStartup: { addListener(fn: EventCallback) { onStartup = fn; } },
      onMessage: { addListener(fn: MessageCallback) { onMessage = fn; } }
    },
    alarms: {
      onAlarm: { addListener(fn: AlarmCallback) { onAlarm = fn; } },
      async clear(name: string) { f.alarmClears.push(name); },
      async create(name: string, options: { periodInMinutes: number }) {
        f.alarmCreates.push({ name, ...options });
      }
    }
  };
  const context = vm.createContext({
    browser: api, URL, AbortSignal, console,
    fetch: async (url: URL, options: RequestInit) => {
      assert.equal(url.href, new URL('api_jsonrpc.php', store.config?.url ?? base.url).href);
      assert.equal(new Headers(options.headers).get('Authorization'), 'Bearer test-token');
      assert.equal(options.credentials, 'omit');
      assert.equal(options.redirect, 'error');
      if (f.fail) throw new Error('Sem rede');
      const request = JSON.parse(String(options.body)) as { method: string; params: Record<string, unknown> };
      f.requests.push(request);
      const { method, params } = request;
      const result = method === 'problem.get'
        ? f.rows.filter(p => (params.suppressed == null || (p.suppressed === '1') === params.suppressed) &&
          (params.severities as number[]).includes(Number(p.severity)))
        : (params.triggerids as string[]).map(triggerid => ({ triggerid, hosts: [{ name: 'Router' }] }));
      return { ok: true, json: async () => ({ result }) };
    }
  });
  vm.runInContext(readFileSync(new URL('../background.js', import.meta.url), 'utf8'), context);
  return f;
}
function problem(id: number, suppressed = '0'): Problem {
  return { eventid: String(id), objectid: String(id + 10), name: 'Problema ' + id,
    severity: '4', clock: String(id), acknowledged: '0', suppressed };
}
function ids(f: Fixture): string[] { return f.store.state?.rows?.map(p => p.eventid) ?? []; }

test('configuração valida URL, token e intervalos; suprimidos ficam ocultos por padrão', () => {
  for (const interval of [30, 45, 60]) {
    const c = Zabbix.config({ ...base, url: 'https://example.test/zabbix/', token: ' test-token ', interval });
    assert.equal(c.url, 'https://example.test/zabbix/');
    assert.equal(c.token, 'test-token');
    assert.equal(c.showSuppressed, false);
  }
  for (const url of ['', 'http://example.test', 'https://user:pass@example.test', 'https://example.test/?x=1']) {
    assert.throws(() => Zabbix.config({ ...base, url }));
  }
  assert.throws(() => Zabbix.config({ ...base, interval: 5 }));
  assert.throws(() => Zabbix.config({ ...base, token: '' }));
  for (const value of [undefined, false, 'false', 'true', 1]) {
    assert.equal(Zabbix.config({ ...base, showSuppressed: value }).showSuppressed, false);
  }
  assert.equal(Zabbix.config({ ...base, showSuppressed: true }).showSuppressed, true);
});
test('link do evento preserva subdiretório e valida identificadores', () => {
  assert.equal(Zabbix.incident('https://example.test/zabbix/', { eventid: '123', objectid: '456' }),
    'https://example.test/zabbix/tr_events.php?triggerid=456&eventid=123');
  assert.throws(() => Zabbix.incident(base.url, { eventid: 'x', objectid: '456' }));
});
test('primeira consulta silenciosa, deduplicação e preservação da lista em falha', async () => {
  const f = fixture();
  f.rows = [problem(1)];
  await f.poll();
  assert.equal(f.notices.length, 0);
  f.rows.push(problem(2));
  await f.poll();
  assert.equal(f.notices.length, 1);
  assert.match(f.store.state?.links?.['event-2'] ?? '', /eventid=2/);
  await f.poll();
  assert.equal(f.notices.length, 1);
  f.fail = true;
  await f.poll();
  assert.deepEqual(ids(f), ['1', '2']);
  assert.match(f.store.state?.error ?? '', /Sem rede/);
  assert.equal(f.badges.at(-1), '!');
});
test('configuração antiga exclui suprimidos da lista, contador e notificações', async () => {
  const f = fixture({ config: base, state: {
    initialized: true, seen: ['1', '2'], rows: [problem(1), problem(2, '1')]
  } });
  f.rows = [problem(1), problem(2, '1')];
  await f.poll();
  assert.deepEqual(ids(f), ['1']);
  assert.equal(f.badges.at(-1), '1');
  f.rows.push(problem(3, '1'));
  await f.poll();
  assert.equal(f.notices.length, 0);
  f.rows.push(problem(4));
  await f.poll();
  assert.deepEqual(ids(f), ['1', '4']);
  assert.equal(f.badges.at(-1), '2');
  assert.equal(f.notices.length, 1);
  f.rows = [problem(2, '1')];
  await f.poll();
  assert.deepEqual(ids(f), []);
  assert.equal(f.badges.at(-1), '');
});
test('filtro inclui ambos os tipos, preserva conexão e não notifica eventos retroativos', async () => {
  const f = fixture();
  f.rows = [problem(1), problem(2, '1')];
  await f.poll();
  f.store.state!.links = { 'event-99': 'https://example.test/old' };
  assert.equal((await f.send({ type: 'preferences', showSuppressed: true })).ok, true);
  assert.deepEqual(ids(f), ['1', '2']);
  assert.equal(f.notices.length, 0);
  assert.equal(f.store.state?.links?.['event-99'], 'https://example.test/old');
  f.rows.push(problem(3, '1'));
  await f.poll();
  assert.equal(f.notices.length, 1);
  assert.equal((await f.send({ type: 'preferences', showSuppressed: false })).ok, true);
  assert.deepEqual(ids(f), ['1']);
  assert.equal(f.notices.length, 1);
  assert.deepEqual(f.store.config, { ...base, showSuppressed: false });
});
test('falha ao consultar novo filtro mantém referência silenciosa até a recuperação', async () => {
  const f = fixture();
  f.rows = [problem(1)];
  await f.poll();
  f.fail = true;
  await f.send({ type: 'preferences', showSuppressed: true });
  assert.equal(f.store.state?.initialized, false);
  assert.match(f.store.state?.error ?? '', /Sem rede/);
  f.fail = false;
  f.rows.push(problem(2, '1'));
  await f.poll();
  assert.deepEqual(ids(f), ['1', '2']);
  assert.equal(f.notices.length, 0);
});
test('parar cancela agendamento e bloqueia consultas automáticas inclusive ao reiniciar', async () => {
  const f = fixture();
  f.rows = [problem(1)];
  await f.startup();
  assert.equal(f.alarmCreates.at(-1)?.periodInMinutes, 0.5);
  assert.equal((await f.send({ type: 'monitoring', paused: true })).ok, true);
  const requests = f.requests.length;
  const alarms = f.alarmCreates.length;
  f.rows.push(problem(2));
  await f.poll();
  await f.startup();
  await f.installed();
  assert.equal(f.requests.length, requests);
  assert.equal(f.alarmCreates.length, alarms);
  assert.equal(f.alarmClears.at(-1), 'zabbix-poll');
  assert.deepEqual(ids(f), ['1']);
  assert.equal(f.store.controls?.paused, true);
});
test('atualização manual funciona durante pausa e retomar não gera uma fila de alertas', async () => {
  const f = fixture();
  f.rows = [problem(1)];
  await f.poll();
  await f.send({ type: 'monitoring', paused: true });
  f.rows.push(problem(2));
  await f.send({ type: 'refresh' });
  assert.deepEqual(ids(f), ['1', '2']);
  assert.equal(f.store.controls?.paused, true);
  const notices = f.notices.length;
  f.rows.push(problem(3));
  await f.send({ type: 'monitoring', paused: false });
  assert.deepEqual(ids(f), ['1', '2', '3']);
  assert.equal(f.alarmCreates.at(-1)?.periodInMinutes, 0.5);
  assert.equal(f.notices.length, notices);
  f.rows.push(problem(4));
  await f.poll();
  assert.equal(f.notices.length, notices + 1);
});
test('não perturbe mantém lista e contador, sem alertar durante ou após o silêncio', async () => {
  const f = fixture();
  f.rows = [problem(1)];
  await f.poll();
  await f.send({ type: 'mute', muted: true });
  f.rows.push(problem(2));
  await f.poll();
  assert.deepEqual(ids(f), ['1', '2']);
  assert.equal(f.badges.at(-1), '2');
  assert.equal(f.notices.length, 0);
  await f.startup();
  assert.equal(f.store.controls?.muted, true);
  assert.equal(f.notices.length, 0);
  await f.send({ type: 'mute', muted: false });
  await f.poll();
  assert.equal(f.notices.length, 0);
  f.rows.push(problem(3));
  await f.poll();
  assert.equal(f.notices.length, 1);
  assert.match(f.notices.at(-1)?.[1].message ?? '', /Problema 3/);
});
test('pausa e não perturbe são independentes e persistem ao editar a conexão', async () => {
  const f = fixture();
  await f.send({ type: 'mute', muted: true });
  await f.send({ type: 'monitoring', paused: true });
  assert.deepEqual(f.store.controls, { muted: true, paused: true });
  const before = structuredClone(f.store.config);
  assert.equal((await f.send({ type: 'monitoring', paused: 'false' })).ok, false);
  assert.equal((await f.send({ type: 'mute', muted: 'true' })).ok, false);
  assert.equal((await f.send({ type: 'preferences', showSuppressed: 'false' })).ok, false);
  assert.deepEqual(f.store.config, before);
  assert.deepEqual(f.store.controls, { muted: true, paused: true });
  await f.send({ type: 'save', config: { ...base, interval: 60 } });
  assert.deepEqual(f.store.controls, { muted: true, paused: true });
  assert.equal(f.store.config?.interval, 60);
  assert.equal(f.alarmCreates.length, 0);
});
test('controles exigem conexão configurada', async () => {
  const f = fixture({});
  assert.equal((await f.send({ type: 'monitoring', paused: true })).ok, false);
  assert.equal((await f.send({ type: 'mute', muted: true })).ok, false);
  assert.equal((await f.send({ type: 'preferences', showSuppressed: false })).ok, false);
  assert.equal(f.store.controls, undefined);
  assert.equal(f.requests.length, 0);
});

test('severidades têm padrão completo e rejeitam seleção vazia ou inválida', () => {
  assert.deepEqual(Zabbix.normalizeSeverities(undefined), [0,1,2,3,4,5]);
  assert.deepEqual(Zabbix.normalizeSeverities([5,4,4]), [4,5]);
  assert.deepEqual(Zabbix.config(base).severities, [0,1,2,3,4,5]);
  for (const value of [[], [6], [-1], [1.5], ['4'], null, '4']) {
    assert.throws(() => Zabbix.normalizeSeverities(value));
  }
});
test('severidades filtram a lista, contador e novas notificações', async () => {
  const f = fixture({ config: { ...base, severities: [4,5] } });
  f.rows = [{ ...problem(1), severity: '2' }, problem(2), { ...problem(3), severity: '5' }];
  await f.poll();
  assert.deepEqual(ids(f), ['2','3']);
  assert.equal(f.badges.at(-1), '2');
  f.rows.push({ ...problem(4), severity: '3' });
  await f.poll();
  assert.equal(f.notices.length, 0);
  f.rows.push({ ...problem(5), severity: '5' });
  await f.poll();
  assert.deepEqual(ids(f), ['2','3','5']);
  assert.equal(f.badges.at(-1), '3');
  assert.equal(f.notices.length, 1);
});
test('salvar severidades preserva conexão e modos sem notificações retroativas', async () => {
  const f = fixture({ config: base, controls: { paused: true, muted: true } });
  f.rows = [{ ...problem(1), severity: '2' }, problem(2)];
  assert.equal((await f.send({ type: 'preferences', showSuppressed: false, severities: [5,4] })).ok, true);
  assert.deepEqual(ids(f), ['2']);
  assert.deepEqual(f.store.config, { ...base, showSuppressed: false, severities: [4,5] });
  assert.deepEqual(f.store.controls, { paused: true, muted: true });
  const before = structuredClone(f.store);
  assert.equal((await f.send({ type: 'preferences', showSuppressed: true, severities: [] })).ok, false);
  assert.deepEqual(f.store, before);
  await f.send({ type: 'preferences', showSuppressed: false, severities: [0,1,2,3,4,5] });
  assert.deepEqual(ids(f), ['1','2']);
  assert.equal(f.notices.length, 0);
});
