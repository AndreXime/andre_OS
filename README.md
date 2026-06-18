# Andre OS

Um blog pessoal e portfólio criativo que utiliza a estética de um sistema operativo para organizar o conteúdo. A interface funciona como um dashboard onde cada "janela" ou cartão é uma porta de entrada para artigos, ferramentas interativas ou recomendações.

**Site configurado:** [https://andreximenes.xyz](https://andreximenes.xyz) (deploy via Vercel)

## Stack

| Camada | Tecnologia |
|--------|------------|
| Site | Astro 6, TypeScript |
| Interatividade | React 19 (ferramentas/apps) |
| Estilo | Tailwind CSS v4 |
| Deploy | Vercel adapter |
| Conteúdo | Content Collections (Markdown) |

## Funcionalidades

O projeto organiza o conhecimento em três formatos distintos acessíveis a partir da home:

- **Posts**: artigos técnicos e textos explicativos renderizados em páginas dedicadas focadas na leitura
- **Ferramentas (Apps)**: aplicações web completas e interativas executadas dentro do ambiente do site
- **Links**: cartões de recomendação rápida que direcionam para referências externas ou recursos interessantes

## Como rodar

```bash
npm install
npm run dev       # http://localhost:4321
npm run build
npm run preview
npm run lint      # biome + astro check
```

## Conteúdo

Os posts são arquivos **`.md`** em `src/content/posts/`, organizados por tipo:

```text
src/content/posts/
├── notes/    # artigos e notas técnicas (type: note)
├── tools/    # cartões que abrem apps internas (type: tool)
└── links/    # recomendações externas (type: link)
```

Cada arquivo usa frontmatter com `title`, `slug`, `type`, `date` e, quando aplicável, `target` (nome da app ou URL externa). Exemplo:

```md
---
slug: "nestjs-a-melhor-framework-para-apis-convencionais-em-typescript"
type: note
title: "NestJS: o melhor framework para APIs convencionais em TypeScript"
date: 2026-05-29
---
```

## Estrutura

```text
andre_OS/
├── src/
│   ├── content/posts/    # notes/, tools/ e links/ (.md)
│   ├── pages/            # rotas Astro (/, /post, /app, /link)
│   ├── tools/            # apps interativos (React)
│   ├── components/       # layout e UI estilo desktop
│   └── lib/              # utilitários, paths, storage de ferramentas
└── public/
```

## Ferramentas incluídas

Planejador semanal, planejador financeiro, leitor RSS, ferramentas de imagem, bloco de notas, livro de receitas, criador de currículos e utilitários do dia a dia — cada uma exposta como "app" no desktop simulado.
