# Instruções para agentes de IA — Zabbix Notifier

Estas regras valem para este projeto e complementam o `AGENTS.md` da pasta superior (`Downloads/`). Em caso de conflito, prevalecem as regras mais restritivas, em especial as de ações destrutivas ou irreversíveis, que exigem aprovação explícita do usuário.

## README multilíngue

Ao editar o README, aplique a mesma alteração nos três idiomas, na mesma tarefa:

- `README.md` (inglês, principal);
- `README.pt-BR.md` (português do Brasil);
- `README.es.md` (espanhol).

Mantenha a mesma estrutura de seções e a linha de links entre idiomas no topo de cada arquivo. Use nos textos os mesmos nomes de botões e rótulos de `_locales/<idioma>/messages.json`. Nunca atualize só um dos arquivos nem deixe os outros dois desatualizados.

## Correção de defeitos: teste primeiro

Para cada defeito encontrado, siga esta ordem, sem pular etapas:

1. Escreva primeiro um teste que reproduza o defeito, em `tests/notifier.test.ts` ou em arquivo de teste novo da mesma suíte.
2. Execute o teste e confirme que ele falha pelo motivo esperado, simulando o defeito. Um teste que passa antes da correção não prova nada e deve ser revisto.
3. Só então faça a correção, de forma pequena e localizada, editando os fontes TypeScript em `src/`.
4. Execute `npm test` e confirme que o novo teste passa junto com os demais.

Relate na resposta o teste criado, a falha observada antes da correção e o resultado depois dela. Cada defeito corrigido deve deixar um teste de regressão na suíte.
