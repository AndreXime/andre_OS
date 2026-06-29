# dev.andreximenes

Hub editorial de André Ximenes: notas longas, ferramentas web e links curados. Visual tema Almanac (papel frio, acento laranja, tipografia Hanken Grotesk).

**Site:** [https://dev.andreximenes.xyz](https://dev.andreximenes.xyz)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Site | Astro 6, TypeScript |
| Interatividade | React 19 (ferramentas em `/app/*`) |
| Estilo | Tailwind CSS v4 + tokens OKLCH |
| Deploy | Vercel adapter |
| Conteúdo | Content Collections (Markdown) |

## Conteúdo

Três tipos de publicação, acessíveis pela home e pelas seções do nav:

- **Notas** (`/post`): artigos técnicos em Markdown
- **Ferramentas** (`/app`): apps React no navegador (planejador, RSS, CV, etc.)
- **Links** (`/link`): curadoria com favicon e link externo

Arquivos em `src/content/posts/` (`notes/`, `tools/`, `links/`), com frontmatter `title`, `slug`, `type`, `date` e `target` quando aplicável.

## Como rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm run build
npm run preview
npm run lint      # biome + astro check
```

## Estrutura

```text
src/
├── content/posts/       # notas, tools e links (.md)
├── pages/               # /, /post, /app, /link, /autor
├── components/
│   ├── layout/          # MainLayout, HubListingLayout, AppLayout
│   └── ui/              # Nav, ContentTable, HubSearchEmpty
├── lib/
│   ├── hubSections.ts   # seções do hub (nav, listagens)
│   ├── hubUi.ts         # classes compartilhadas do hub
│   └── toolUi.ts        # classes compartilhadas das ferramentas
├── styles/
│   ├── tokens.css       # design tokens (Almanac)
│   └── global.css       # Tailwind + tema
└── tools/               # apps React (ToolShell + toolUi)
```

## Design

Ver `design.md` e `src/styles/tokens.css` para o sistema visual. Ferramentas usam `ToolShell` e as classes compartilhadas em `src/lib/toolUi.ts`.

## Ferramentas incluídas

Planejador semanal, planejador financeiro, leitor RSS, ferramentas de imagem, bloco de notas, livro de receitas, gerador de CV e utilitários do dia a dia.
