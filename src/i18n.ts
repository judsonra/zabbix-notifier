type I18n = { getMessage(key: string, substitutions?: string[]): string; getUILanguage(): string };

function i18n(): I18n | undefined {
  const g = globalThis as { browser?: { i18n?: I18n }; chrome?: { i18n?: I18n } };
  return g.browser?.i18n ?? g.chrome?.i18n;
}

/** Texto localizado via _locales; sem API disponível (ex.: testes), devolve a própria chave. */
export function t(key: string, ...substitutions: (string | number)[]): string {
  return i18n()?.getMessage(key, substitutions.map(String)) || key;
}
export function uiLanguage(): string {
  return i18n()?.getUILanguage() || 'pt-BR';
}
export function formatDate(value: number | Date): string {
  return new Date(value).toLocaleString(uiLanguage());
}
export function severityName(level: number): string {
  return t(`sev${level}`);
}
