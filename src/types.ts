export interface Config {
  url: string;
  token: string;
  interval: 30 | 45 | 60;
  showSuppressed?: boolean;
  severities?: number[];
}
export interface Controls {
  paused?: boolean;
  muted?: boolean;
}
export interface Problem {
  eventid: string;
  objectid: string;
  name: string;
  severity: string;
  clock: string;
  acknowledged: string;
  suppressed?: string;
  host?: string;
}
export interface Trigger {
  triggerid: string;
  hosts: { name: string }[];
}
export interface State {
  rows?: Problem[];
  seen?: string[];
  initialized?: boolean;
  links?: Record<string, string>;
  checkedAt?: number;
  attemptedAt?: number;
  error?: string;
}
export interface StoredData {
  config?: Config;
  controls?: Controls;
  state?: State;
}
export type Message =
  | { type: 'save'; config: Config }
  | { type: 'preferences'; showSuppressed: boolean; severities?: number[] }
  | { type: 'monitoring'; paused: boolean }
  | { type: 'mute'; muted: boolean }
  | { type: 'refresh' }
  | { type: 'disconnect' };
export type Reply = { ok: true } | { ok: false; error: string };
