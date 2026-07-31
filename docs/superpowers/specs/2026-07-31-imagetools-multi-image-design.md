# ImageTools: fila multi-imagem com lote

**Data:** 2026-07-31  
**Status:** aprovado para planejamento  
**Escopo:** `src/tools/ImageTools`

## Problema

O ImageTools processa uma imagem por vez (`$sourceFile` / `$resultBlob`). O upload ignora tudo além do primeiro arquivo. O usuário precisa editar várias imagens na mesma sessão e, quando quiser, aplicar a mesma operação em um subconjunto selecionado.

## Objetivos

- Fila de imagens com preview e edição do item ativo
- Lote: mesmas configs do painel aplicadas às imagens selecionadas
- Download individual quando exatamente uma selecionada tem resultado; ZIP quando duas ou mais selecionadas têm resultado
- Convert/compress com concorrência limitada (até 3); remoção de fundo sempre sequencial
- Tudo continua no navegador, sem upload para servidor

## Fora de escopo (v1)

- Configs por item (formato/qualidade diferentes por imagem)
- Processar “pendentes” automaticamente sem seleção
- Teto rígido de quantidade de arquivos
- Persistência da fila entre reloads

## Abordagem

Evoluir o store nanostores atual para uma lista de itens, reaproveitando `useImageProcessor` e `useBgRemoval`. Um runner de lote orquestra concorrência e cancelamento. Sem reescrever a tool em workspaces isolados.

## Modelo de dados

### Item (`ImageItem`)

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador estável (uuid/nanoid simples) |
| `file` | `File` original |
| `sourceUrl` | Object URL do source |
| `dimensions` | `{ width, height }` |
| `hasAlpha` | boolean |
| `status` | `idle` \| `loading` \| `ready` \| `processing` \| `done` \| `error` |
| `resultBlob` / `resultUrl` | Presentes quando `done` |
| `error` | Mensagem por item, se houver |
| `lastOperation` | `OperationType` usada no último resultado (para nome do download) |

Estados de ciclo de vida:

1. Upload → `loading` → `ready` (ou `error` se validação/carregamento falhar)
2. Processamento → `processing` → `done` ou `error`
3. Remover item / `clearAll` → revoga object URLs

### Atoms globais

- `$items: ImageItem[]`
- `$activeItemId: string | null` — item no painel de preview
- `$selectedIds: string[]` — seleção para lote e download (array para encaixar no nanostores sem custom equality)
- `$activeOperation`, `$outputFormat`, `$quality`, `$compressMaxWidth` — configs do painel (globais; lote copia estas configs)
- `$batchRunning`, `$batchProgress` — `{ current, total, label }` durante lote
- `$supportedFormats`, `$modelPreloadStatus`, `$modelPreloadProgress` — como hoje
- `$error` global opcional — só para falhas de sessão (ex.: preload do modelo), erros de arquivo ficam no item

### Regras

- Upload múltiplo: `input multiple` + drop com N arquivos; cada um validado com `validateImageFile` / `validateDimensions`
- Arquivo inválido: **não entra** na fila; `$error` global lista os nomes rejeitados (ex.: “3 arquivos ignorados: …”)
- Trocar `$activeItemId` só muda o que o painel mostra; não reseta configs globais
- Remover item ativo: promove outro item da lista (ou `null` se vazia)
- `clearAll`: cancela lote/processamento, revoga todos os URLs, zera seleção

## UI

### Vazio

Dropzone atual, com `multiple` e texto indicando vários arquivos.

### Com itens

Layout:

- **Lista:** thumb, nome, status, checkbox de seleção; clique (fora do checkbox) define ativo
- **Painel:** preview source/result do ativo, seletor de operação, configs, progresso do item ou do lote
- **Breakpoints:** coluna única até `md`; lista + painel lado a lado a partir de `lg` (regra mobile-first do projeto)

Ações:

| Ação | Comportamento |
|------|----------------|
| Aplicar | Processa só o item ativo com as configs atuais |
| Aplicar nas selecionadas | Lote nas `$selectedIds` com as mesmas configs (≥1 selecionada) |
| Remover | Remove item (e da seleção) |
| Limpar tudo | `clearAll` |
| Download | Ver seção Download |

Seleção: checkbox por item + “selecionar todas” / “limpar seleção” na barra da lista.

## Processamento

### Item único

Adaptar `convert` / `compress` / `removeBackground` para receber `itemId`, atualizar status/resultado daquele item, e manter `AbortController` por operação (ou por lote).

### Lote

1. Congela a lista de IDs selecionados no início
2. Aplica `$activeOperation` + configs globais a todos
3. Fila de jobs:
   - `convert` / `compress`: concorrência máxima **3**
   - `bg-removal`: concorrência **1**
4. Progresso agregado: `current/total` + label; cada item `processing` → `done`/`error`
5. Cancelar lote: aborta em andamento; itens ainda na fila voltam a `ready` (sem resultado novo); itens já `done` permanecem

Falha em um item não interrompe o lote.

## Download

- Exatamente **1** selecionada com `status === done` → download do blob com `buildDownloadFilename` (estender para usar `lastOperation` do item)
- **≥2** selecionadas com `done` → gerar ZIP só com essas; nome sugerido: `imagens_processadas.zip`
- Selecionadas sem resultado: ignoradas no ZIP; se nenhuma `done` entre as selecionadas, botão desabilitado
- Biblioteca: **`fflate`** via import dinâmico (leve; não há jszip/fflate no projeto ainda)

## Erros e limites

- Limites atuais por arquivo: `MAX_FILE_BYTES`, `MAX_DIMENSION`, formatos aceitos
- Sem limite de quantidade na v1
- Erro de preload do modelo de bg: global, como hoje; lote de bg-removal só roda se modelo `ready` (ou retry)

## Arquivos impactados (previsto)

- `store.ts` — remodelar para lista de itens + seleção + batch
- `domain.ts` — tipo `ImageItem`, helpers de seleção/download se necessário
- `ImageToolsView.tsx` — lista + painel + ações de lote/ZIP
- `hooks/useImageProcessor.ts`, `hooks/useBgRemoval.ts` — operar por `itemId`
- Novo: `batchRunner.ts` (ou similar) — fila com concorrência
- Novo: `zipDownload.ts` — monta ZIP com fflate
- `package.json` — adicionar `fflate`
- `styles.css` — ajustes da lista multi-item

## Verificação manual

1. Upload de 1 e de N arquivos
2. Aplicar no ativo vs aplicar nas selecionadas
3. Cancelar no meio do lote (convert e bg-removal)
4. Download individual (1 selecionada done) e ZIP (≥2)
5. Remoção de fundo em lote (sequencial, progresso por item)
6. Remover item / limpar tudo sem vazamento de object URLs (checagem via DevTools se possível)
7. Layout mobile e `lg`

## Decisões tomadas

| Tópico | Decisão |
|--------|---------|
| UX base | Fila + edição do ativo (B) com lote |
| Configs do lote | Mesmas do painel (A) |
| Escopo do lote | Só selecionadas (A) |
| Download | Individual se 1; ZIP se ≥2 com resultado (C) |
| Concorrência | Até 3 convert/compress; bg-removal sequencial (B) |
| Arquitetura | Evoluir store atual (abordagem 1) |
| ZIP | `fflate` dinâmico |
