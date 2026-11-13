import type { Config, Problem } from './types';
import { t } from './i18n';

export function config(input: unknown): Config {
  if (!input || typeof input !== 'object') throw new Error(t('errConfigInvalid'));
  const value = input as Record<string, unknown>;
  if (typeof value.url !== 'string') throw new Error(t('errEnterUrl'));
  if (typeof value.token !== 'string' || !value.token.trim()) throw new Error(t('errEnterToken'));
  const url = new URL(value.url.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error(t('errUrlRule'));
  }
  const interval = Number(value.interval);
  if (interval !== 30 && interval !== 45 && interval !== 60) throw new Error(t('errInterval'));
  url.pathname = url.pathname.replace(/\/(?:api_jsonrpc\.php|index\.php|zabbix\.php)\/?$/, '/').replace(/\/*$/, '/');
  return { url: url.href, token: value.token.trim(), interval, showSuppressed: value.showSuppressed === true, severities: normalizeSeverities(value.severities) };
}

export function incident(base: string, problem: Pick<Problem, 'eventid' | 'objectid'>): string {
  if (!/^\d+$/.test(problem.eventid) || !/^\d+$/.test(problem.objectid)) throw new Error(t('errIncident'));
  const url = new URL('tr_events.php', base);
  url.searchParams.set('triggerid', problem.objectid);
  url.searchParams.set('eventid', problem.eventid);
  return url.href;
}

export function normalizeSeverities(input: unknown): number[] {
  if (input === undefined) return [0, 1, 2, 3, 4, 5];
  if (!Array.isArray(input) || !input.length ||
      !input.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 5)) {
    throw new Error(t('errSeverities'));
  }
  return [...new Set(input as number[])].sort((a, b) => a - b);
}
