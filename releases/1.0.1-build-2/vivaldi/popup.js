const api = globalThis.browser || chrome;
const $ = id => document.getElementById(id);
let saved;
async function render() {
  const { config, state = {} } = await api.storage.local.get(['config', 'state']);
  saved = config;
  $('count').textContent = String(state.rows?.length ?? 0);
  $('status').textContent = state.error ? `Falha na consulta: ${state.error}. A lista pode estar desatualizada.` : state.checkedAt ? `Última consulta: ${new Date(state.checkedAt).toLocaleString('pt-BR')}` : 'Configure sua conexão para começar.';
  $('refresh').disabled = !config;
  $('disconnect').disabled = !config;
  $('save-preferences').disabled = !config;
  $('problems').replaceChildren();
  if (!state.rows?.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = config ? 'Nenhum problema ativo na última consulta.' : 'Seus alarmes aparecerão aqui.';
    $('problems').append(empty);
  }
  for (const p of state.rows || []) {
    const a = document.createElement('a');
    a.className = `problem severity-${p.severity}`;
    a.href = Zabbix.incident(config.url, p); a.target = '_blank'; a.rel = 'noopener noreferrer';
    const host = document.createElement('strong'); host.textContent = p.host;
    const name = document.createElement('span'); name.textContent = p.name;
    const detail = document.createElement('small');
    detail.textContent = `${Zabbix.severity[Number(p.severity)]} · ${new Date(Number(p.clock) * 1000).toLocaleString('pt-BR')} · ${p.acknowledged === '1' ? 'Reconhecido' : 'Não reconhecido'}${p.suppressed === '1' ? ' · Suprimido' : ''}`;
    a.append(host, name, detail); $('problems').append(a);
  }
}
async function send(message) {
  const reply = await api.runtime.sendMessage(message);
  if (!reply?.ok) throw new Error(reply?.error || 'Não foi possível executar a operação.');
  await render();
}
$('form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter; button.disabled = true;
  try {
    const config = Zabbix.config({ url: $('url').value, token: $('token').value, interval: $('interval').value, showSuppressed: $('show-suppressed').checked });
    const granted = await api.permissions.request({ origins: [new URL(config.url).origin + '/*'] });
    if (!granted) throw new Error('Permissão de acesso ao Zabbix não concedida.');
    $('status').textContent = 'Testando conexão…';
    await send({ type: 'save', config });
    $('token').value = '';
    $('connection').hidden = true;
  } catch (error) { $('status').textContent = error.message; }
  finally { button.disabled = false; }
});
$('save-preferences').addEventListener('click', async () => {
  const button = $('save-preferences'); button.disabled = true;
  try {
    await send({ type: 'preferences', showSuppressed: $('show-suppressed').checked });
    $('connection').hidden = true;
  } catch (error) { $('status').textContent = error.message; }
  finally { button.disabled = !saved; }
});
$('settings').addEventListener('click', () => { $('connection').hidden = !$('connection').hidden; });
$('refresh').addEventListener('click', async () => {
  $('refresh').disabled = true;
  try { await send({ type: 'refresh' }); } catch (e) { $('status').textContent = e.message; }
  finally { $('refresh').disabled = !saved; }
});
$('disconnect').addEventListener('click', async () => {
  try {
    await send({ type: 'disconnect' });
    $('token').value = ''; $('url').value = ''; $('show-suppressed').checked = false; $('connection').hidden = false;
  } catch (e) { $('status').textContent = e.message; }
});
api.storage.onChanged.addListener((changes, area) => { if (area === 'local' && changes.state) render(); });
render().then(() => {
  if (saved) { $('url').value = saved.url; $('interval').value = String(saved.interval); }
  $('show-suppressed').checked = saved?.showSuppressed === true;
  $('connection').hidden = Boolean(saved);
}).catch(e => { $('status').textContent = e.message; });
