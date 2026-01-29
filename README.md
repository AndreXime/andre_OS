# Andre OS

Um blog pessoal e portfólio criativo que utiliza a estética de um sistema operativo para organizar o conteúdo. A interface funciona como um dashboard onde cada "janela" ou cartão é uma porta de entrada para artigos, ferramentas interativas ou recomendações.

## Tecnologias Utilizadas

* **[Astro](https://astro.build/)**: Serve a estrutura base do site e as páginas de conteúdo (posts) com máxima performance, utilizando renderização no servidor (SSR) para dados dinâmicos.
* **[Preact](https://preactjs.com/)**: Gerencia a interatividade das ferramentas web (Apps) e do painel administrativo com uma pegada leve, utilizando *aliasing* para compatibilidade com React.
* **[LibSQL (Turso)](https://turso.tech/libsql)**: Atua como a base de dados central para armazenar todos os posts, referências de links e configurações das ferramentas.
* **[Docker](https://www.docker.com/)**: Simplifica o ambiente de desenvolvimento ao rodar uma instância local do banco de dados LibSQL isolada do sistema principal.
* **[Tailwind CSS v4](https://tailwindcss.com/)**: Permite criar o design visual complexo estilo "Desktop" e os componentes de UI de forma rápida e responsiva.

## Funcionalidades

O projeto organiza o conhecimento em três formatos distintos acessíveis a partir da home:

* **Posts**: Artigos técnicos e textos explicativos renderizados em páginas dedicadas focadas na leitura.
* **Ferramentas (Apps)**: Aplicações web completas e interativas desenvolvidas por mim, executadas dentro do próprio ambiente do site.
* **Links**: Cartões de recomendação rápida que direcionam para referências externas ou recursos interessantes.
* **Painel Administrativo**: Interface interna para criação e gestão de todo o conteúdo (CMS) e ferramentas.

