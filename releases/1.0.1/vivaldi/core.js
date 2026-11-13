(function (root) {
  const severity = ['Não classificado', 'Informação', 'Atenção', 'Média', 'Alta', 'Desastre'];
  function config(input) {
    const url = new URL(input.url.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error('Informe uma URL HTTPS, sem credenciais, parâmetros ou fragmentos.');
    if (!input.token.trim()) throw new Error('Informe o token de API.');
    if (![30, 45, 60].includes(Number(input.interval))) throw new Error('Intervalo inválido.');
    url.pathname = url.pathname.replace(/\/(?:api_jsonrpc\.php|index\.php|zabbix\.php)\/?$/, '/').replace(/\/*$/, '/');
    return { url: url.href, token: input.token.trim(), interval: Number(input.interval), showSuppressed: input.showSuppressed === true };
  }
  function incident(base, problem) {
    if (!/^\d+$/.test(problem.eventid) || !/^\d+$/.test(problem.objectid)) throw new Error('Incidente inválido.');
    const url = new URL('tr_events.php', base);
    url.searchParams.set('triggerid', problem.objectid);
    url.searchParams.set('eventid', problem.eventid);
    return url.href;
  }
  root.Zabbix = { config, incident, severity };
})(globalThis);
