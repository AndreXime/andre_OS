# Design · Hub de Conteúdo Técnico

Sistema visual locked para o hub de um autor. Páginas de conteúdo leem este arquivo antes de emitir código.

## Genre

editorial

## Macrostructure family

- **Hub pages** (home, índices): Ecosystem Index — trilhos de descoberta (recente · notas · ferramentas · links)
- **Content pages** (artigos): Long Document — coluna única, medida 65ch, tipografia contínua
- **App pages** (ferramentas): Workbench — chrome mínimo, a ferramenta carrega a página

## Theme

Almanac — papel frio · acento laranja · display geométrico

- `--color-paper`   oklch(94% 0.008 245)
- `--color-paper-2` oklch(91% 0.010 245)
- `--color-paper-3` oklch(86% 0.012 240)
- `--color-ink`     oklch(16% 0.020 245)
- `--color-ink-2`   oklch(20% 0.018 245)
- `--color-muted`   oklch(46% 0.014 245)
- `--color-rule`    oklch(74% 0.012 240)
- `--color-accent`  oklch(58% 0.20 42)
- `--color-focus`   oklch(58% 0.20 42)

## Typography

- Display: Hanken Grotesk, weight 600, normal
- Body: Hanken Grotesk, weight 400
- Mono: IBM Plex Mono, weight 400 (rótulos, datas, metadados)
- Display tracking: -0.014em
- Type scale anchor: `--text-display` = clamp(2.25rem, 3.5vw + 1rem, 3.75rem)

## Spacing

Escala 4pt nomeada em `src/styles/tokens.css`. Usar `var(--space-*)`, nunca valores crus.

## Motion

- Easings: `--ease-out`, `--ease-in`, `--ease-in-out`
- Reveal: none (tipografia carrega a página)
- Reduced-motion: opacity-only, ≤ 150ms

## Microinteractions stance

- Silent success
- Hover delay 800ms em tooltips · focus delay 0ms
- Links tipográficos com sublinhado; botões outlined chip

## CTA voice

- Primary: outlined chip, cantos `--radius-input`, verbo + seta
- Secondary: link tipográfico com seta →

## Per-page allowances

- Hub pages: typography only
- Content pages: typography only
- App pages: sem enrichment

## What pages MUST share

- Masthead N6 (wordmark centrado, linha de edição, dupla regra)
- Acento laranja ≤ 5% por viewport
- Hanken Grotesk + IBM Plex Mono
- Listagens tabulares F3 (data · tipo · título)
- Footer colophon Ft4 com link RSS

## What pages MAY differ on

- Número de trilhos no hub (conforme categorias com conteúdo)
- Densidade da listagem tabular por categoria
- Chrome de ferramenta (apenas back link + slot da app)

## Exports

Ver `src/styles/tokens.css` para tokens.css canônico.
