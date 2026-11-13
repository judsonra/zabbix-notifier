# Zabbix Notifier

[English](README.md) · **Português (Brasil)** · [Español](README.es.md)

Extensão para Zabbix 7.0 no Chrome, Firefox, Opera, Vivaldi e Brave. URL inicialmente em branco, token de API e intervalos de 30, 45 ou 60 segundos. Não depende de backend intermediário nem altera dados no Zabbix. A interface está disponível em português (Brasil), inglês e espanhol.

## Instalar no Chrome

1. Abra `chrome://extensions` e habilite o modo do desenvolvedor.
2. Clique em **Carregar sem compactação** e selecione a pasta `chrome` deste projeto.
3. Abra o ícone da extensão, informe URL HTTPS, token e intervalo, e clique em **Testar e salvar conexão**.
4. Autorize o acesso ao servidor informado e permita notificações no sistema operacional.

## Instalar no Opera, Vivaldi ou Brave

Os pacotes usam Manifest V3, com o mesmo código da versão Chrome. Use versões desktop atualizadas, com Chromium 120 ou posterior.

| Navegador | Página de extensões | Pasta deste projeto | Pacote ZIP |
| --- | --- | --- | --- |
| Opera | `opera://extensions` | `opera` | `zabbix-notifier-opera.zip` |
| Vivaldi | `vivaldi://extensions` | `vivaldi` | `zabbix-notifier-vivaldi.zip` |
| Brave | `brave://extensions` | `brave` | `zabbix-notifier-brave.zip` |

1. Abra a página de extensões do navegador e ative **Modo do desenvolvedor**.
2. Clique em **Carregar sem compactação** (ou **Load unpacked**) e selecione a pasta correspondente.
3. Se usar o ZIP, extraia-o primeiro e selecione a pasta que contém `manifest.json`.
4. Abra a extensão, informe URL HTTPS, token e intervalo, e clique em **Testar e salvar conexão**.
5. Autorize o acesso ao servidor e permita notificações no sistema operacional.

A conexão e as permissões devem ser configuradas separadamente em cada navegador. Os pacotes ainda precisam de validação manual nesses navegadores com um servidor Zabbix real.

Referências: [Opera](https://help.opera.com/en/extensions/testing/), [Vivaldi](https://help.vivaldi.com/desktop/appearance-customization/extensions/) e [Brave](https://support.brave.app/hc/en-us/articles/360017909112-How-can-I-add-extensions-to-Brave).

## Instalar no Firefox

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **Carregar extensão temporária** e selecione `firefox/manifest.json`.
3. Configure a conexão pelo ícone da extensão.

A instalação temporária do Firefox termina ao reiniciar o navegador. Instalação permanente e distribuição normal exigem assinatura pela Mozilla; o ZIP incluído ainda não é assinado. Chrome requer versão 120 ou posterior; Firefox requer 140 ou posterior. Os ZIPs são pacotes de distribuição para revisão/publicação, sem credenciais.

## Uso

Em **Configurações → Severidades dos problemas**, selecione quais níveis entram na consulta, lista, contador e notificações. Todas as seis severidades vêm selecionadas, inclusive em conexões antigas. É necessário manter ao menos uma selecionada. Os filtros são salvos automaticamente ao marcar ou desmarcar opções, sem redigitar o token. O painel confirma o salvamento ou informa qualquer falha. Ao tentar desmarcar a última severidade, a opção é mantida selecionada. Ao mudar o filtro, problemas já existentes não geram notificações retroativas.

A barra de ícones contém, nesta ordem:

- **Iniciar/parar verificações automáticas:** o quadrado para as consultas periódicas; o triângulo inicia novamente. A lista anterior permanece visível enquanto pausado. Ao iniciar, a extensão consulta a lista atual sem gerar notificações retroativas.
- **Atualizar agora:** faz uma consulta manual, inclusive quando as verificações automáticas estão pausadas, sem reativá-las.
- **Não perturbe:** mantém as consultas, a lista e o contador atualizados, mas bloqueia novas notificações. Os eventos consultados durante o silêncio são registrados para não serem notificados novamente quando o modo for desativado. Não remove notificações já exibidas pelo sistema.
- **Configurações:** abre ou fecha a conexão e o filtro de problemas suprimidos.

O estado de pausa e de não perturbe é salvo localmente e respeitado ao reabrir o painel ou reiniciar o navegador. Os controles começam com verificações ativas e não perturbe desativado. Os ícones têm descrição ao passar o mouse e nomes acessíveis.

- Informe a URL da interface, incluindo subdiretório quando existir, como `https://servidor.exemplo/zabbix/`. Nenhum servidor vem preenchido.
- Use um token associado a um usuário com acesso de leitura aos hosts e às APIs `problem.get` e `trigger.get`. O monitoramento respeita as permissões desse usuário.
- Em **Configurações**, a opção **Exibir problemas suprimidos** vem desmarcada, inclusive em conexões anteriores à versão 1.0.1. Nesse padrão, a API exclui problemas suprimidos; eles não entram na lista, no contador nem em novas notificações. Ao marcar, a consulta inclui os suprimidos e a lista os identifica como **Suprimido**.
- Essa preferência é salva automaticamente ao alterar, sem redigitar o token. **Testar e salvar conexão** também salva a opção. Ao salvar o filtro, a consulta estabelece uma nova referência sem notificar os problemas já existentes. Em caso de falha na consulta, a lista anterior permanece identificada como possivelmente desatualizada até a próxima consulta bem-sucedida.
- A primeira consulta mostra problemas já existentes sem notificá-los. As seguintes notificam novos problemas. Quando vários chegam juntos, uma notificação resume o lote; a lista contém todos.
- Clique em uma notificação ou item da lista para abrir os detalhes do evento. A interface web pode exigir seu login normal: o token da extensão não autentica a sessão web.
- O contador mostra problemas ativos. `!` indica falha; a lista anterior permanece e é identificada como possivelmente desatualizada.
- O navegador precisa estar em execução. O intervalo é um agendamento solicitado, sem garantia de pontualidade: suspensão, economia de energia e limitação do navegador podem atrasar consultas.
- Eventos que surgirem e forem resolvidos entre consultas não serão detectados, pois esta versão consulta apenas problemas ativos.
- O token é guardado no armazenamento local da extensão, sem sincronização e sem criptografia adicional. **Desconectar e apagar token** remove a conexão local; não revoga o token no servidor. Permissões de acesso já concedidas podem ser revogadas na página de gerenciamento da extensão.
- HTTPS com certificado confiável é obrigatório. O token vai apenas para a API configurada; redirecionamentos são bloqueados. Não há telemetria nem bibliotecas externas.
- Ao editar a conexão, informe novamente o token. Uma conexão inválida não substitui a conexão anterior.

## Atualização 1.0.6

A versão 1.0.6 adiciona suporte a vários idiomas (português do Brasil, inglês e espanhol). As pastas e os ZIPs dela estão em `releases/1.0.6/`, em subpastas `chrome`, `firefox`, `opera`, `vivaldi` e `brave`. Para atualizar uma instalação sem compactação, selecione a pasta do seu navegador dentro de `releases/1.0.6/` ou, se ela já apontar para esse caminho, clique em **Recarregar** na página de extensões. A conexão e as preferências salvas são mantidas.

As pastas `chrome`, `firefox`, `opera`, `vivaldi` e `brave` na raiz do projeto e os ZIPs na raiz continuam em versões anteriores, e as releases anteriores em `releases/` foram preservadas.

## Idiomas

A extensão usa `chrome.i18n` (também disponível no Firefox como `browser.i18n`) e segue o idioma do navegador. Idiomas disponíveis: **português do Brasil** (`pt_BR`, padrão), **inglês** (`en`) e **espanhol** (`es`). Se o navegador estiver em outro idioma, a interface aparece em português do Brasil. Isso vale para o painel, as notificações, as mensagens de erro e o nome e a descrição da extensão na página de extensões. Mensagens de erro devolvidas pela própria API do Zabbix permanecem no idioma do servidor.

As traduções ficam em `_locales/<idioma>/messages.json`. Para adicionar um idioma, copie `_locales/en` para uma nova pasta com o código do idioma (por exemplo `fr`), traduza o campo `message` de cada chave e inclua o código na lista `LOCALES` de `build-extension.py`. Os textos fixos do painel ficam em `popup.html` com os atributos `data-i18n`, `data-i18n-title` e `data-i18n-aria-label`, e os textos dinâmicos usam `t('chave')`, de `src/i18n.ts`. Ao incluir uma chave, adicione-a nos três idiomas.

## Ícones

Os ícones de interface seguem o padrão **Lucide**, com imports centralizados em `src/icons.ts`, tamanho de 20 px e espessura 2. A biblioteca é incluída localmente na build; somente os ícones utilizados entram no pacote. A licença está em `LICENSE-lucide.txt`. A convenção também está registrada na skill pessoal `lucide-icons`.

## Desenvolvimento e validação

Os fontes TypeScript ficam em `src/`: `types.ts` define os dados e mensagens, `platform.ts` concentra a API de extensões e o armazenamento, `i18n.ts` fornece os textos traduzidos, `core.ts` valida configurações e links, `background.ts` executa o monitoramento e `popup.ts` controla o painel. Os arquivos `core.js`, `background.js` e `popup.js` na raiz são gerados automaticamente; edite os arquivos TypeScript.

Instale as dependências de desenvolvimento com `npm ci`. Execute `npm run build` para validar os tipos em modo estrito e compilar os scripts para os navegadores. Execute `npm test` para compilar e executar os testes TypeScript em `tests/notifier.test.ts`. O script de compilação está em `scripts/build.ts`; as dependências e versões exatas estão no `package-lock.json`.

`npm run package:extensions` compila e gera os cinco pacotes em um novo diretório `releases/1.0.6`. Os navegadores executam apenas o JavaScript compilado, sem dependências externas em tempo de execução. `python3 build-extension.py` gera as pastas `chrome` e `firefox` e seus ZIPs, incluindo `_locales`. Para selecionar os navegadores, use:

```sh
python3 build-extension.py --browsers opera vivaldi brave
```

Para gerar todos os cinco em uma nova cópia do projeto, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave`. Por preservação dos arquivos, o gerador recusa destinos existentes; para outra geração use uma nova cópia dos fontes em um diretório vazio.

Para gerar em um diretório novo sem substituir pacotes existentes, use `python3 build-extension.py --browsers chrome firefox opera vivaldi brave --output-dir releases/1.0.6`.

Execute `npm test` para testar configuração, links, polling, filtro de suprimidos, pausa, não perturbe, deduplicação e falhas de rede com APIs simuladas. O comando antigo `node test-notifier.cjs` também encaminha para essa suíte. Esses testes não substituem a validação no navegador e no servidor real.

Documentação: [API Zabbix 7.0](https://www.zabbix.com/documentation/7.0/en/manual/api), [agendamento Chrome](https://developer.chrome.com/docs/extensions/reference/api/alarms), [background Chrome/Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background).
