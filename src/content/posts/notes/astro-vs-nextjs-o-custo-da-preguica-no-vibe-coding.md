---
id: 8
slug: "astro-vs-nextjs-o-custo-da-preguica-no-vibe-coding"
type: note
title: "Astro vs. Next.js: O Custo da Preguiça no Vibe Coding"
date: 2026-03-01
---
A hegemonia do Next.js no desenvolvimento web atual é um sintoma de um mercado viciado em "vibe coding". Ferramentas de IA e plataformas de geração de código foram treinadas massivamente em repositórios React, criando um ciclo de feedback onde a solução para qualquer problema — de um blog estático a um dashboard complexo — é sempre `npx create-next-app`. O resultado é uma engenharia preguiçosa que prioriza a conveniência do desenvolvedor em detrimento da performance do usuário final.

Para 90% dos projetos web, o modelo de Single Page Application (SPA) ou a hidratação completa do Next.js é superengenharia. A maioria da web consiste em conteúdo estático com ilhas de interatividade. O Astro preenche essa lacuna arquitetural ao adotar o padrão de *Islands Architecture* por padrão. Ao contrário do Next.js, que envia o JavaScript necessário para "reviver" a página inteira no cliente, o Astro remove todo o JavaScript por padrão, entregando HTML puro.

A combinação de Astro, Preact e JavaScript Inline (Vanilla) oferece uma abordagem cirúrgica. O Preact, com seus 3kB, deve ser reservado apenas para componentes que exigem gerenciamento de estado complexo. Para interações triviais, como abrir um menu mobile ou alternar um tema dark/light, importar uma biblioteca de renderização é ineficiente. Um bloco `<script>` inline com um `querySelector` e um `classList.toggle` executa em microssegundos e não bloqueia a thread principal.

O argumento de experiência do desenvolvedor não justifica mais o *bloat*. Quando delegamos a renderização de um rodapé estático para um componente React Server Component (RSC) complexo, estamos apenas transferindo complexidade para a infraestrutura ou para o dispositivo do usuário. A stack Astro + Preact força o desenvolvedor a tomar decisões conscientes sobre o que merece ser interativo, restaurando a performance que foi perdida para a conveniência dos padrões automáticos das IAs.
