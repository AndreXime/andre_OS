---
id: 18
slug: "pipeline-hibrido-biome-e-eslint-para-seguranca-e-performance"
type: note
title: "Pipeline Híbrido: Biome e ESLint para Segurança e Performance"
description: "Arquitetura de linting por gatilho: use Biome localmente para velocidade e restrinja o ESLint no CI para SAST e type-checking profundo sem travar o dev."
tags: ["Biome","ESLint","CI/CD","TypeScript"]
featured: false
date: 2026-05-29
---
Separar linters por branch gera inconsistência e quebra pipelines em merges críticos. A arquitetura mais eficiente é a **Abordagem Híbrida por Gatilho (Trigger)**. Em vez de separar por branch, a divisão ocorre pelo momento do pipeline. O ESLint, focado estritamente em segurança e tipagem, roda antes do código entrar na branch `dev`, mas nunca a cada commit local.

O fluxo de trabalho funciona assim:

```text
[Desenvolvedor] ──(Pre-commit / IDE)──> Biome (Lint Rápido + Formatação)
       │
   (Push PR para 'dev')
       ▼
[CI/CD da Feature] ───> 1. Biome (Garante estilo/regras locais)
                        2. ESLint Security (Apenas regras Type-Aware/SAST)

```

### Configuração Prática

**Localmente (IDE + Git Hooks):** Utilize Husky ou Lefthook para executar exclusivamente o Biome. O desenvolvedor obtém feedback em milissegundos ao salvar o arquivo e antes do `git commit`.

**No CI (Pull Requests):** Execute o Biome para garantir que as regras locais não foram ignoradas e, em seguida, o ESLint configurado com um subset estrito. O ESLint deve validar apenas as regras que o Biome não cobre: Type-Aware e Security.

Se o ESLint demorar 40 segundos, o fluxo não é impactado. O desenvolvedor já abriu o PR e não fica travado no terminal. Se houver falha de segurança, o pipeline quebra no PR da feature, protegendo a `dev` e a `main`.

Para mitigar o tempo de execução do ESLint no CI, o uso de cache é obrigatório. Exemplo de configuração no GitHub Actions:

```yaml
# Exemplo de CI no GitHub Actions para Pull Requests
- name: Cache ESLint
  uses: actions/cache@v4
  with:
    path: .eslintcache
    key: ${{ runner.os }}-eslint-${{ hashFiles('**/package-lock.json') }}

- name: Run Fast Lint (Biome)
  run: npx @biomejs/biome ci .

- name: Run Deep Lint (ESLint - Security/Types)
  run: npx eslint . --cache --cache-location .eslintcache

```

### Setup de Elite para o ESLint no CI

Para que o ESLint cumpra seu papel como barreira de segurança e arquitetura, a configuração deve carregar plugins específicos.

#### 1. Core Técnico (Type-Aware)

A base do linter em projetos TypeScript exige análise de tipos.

* **`@typescript-eslint/eslint-plugin`:** O valor real está nas regras atreladas ao `parserOptions.project`. Ele impede vazamento de Promises em background (`no-floating-promises`), bloqueia o uso de `await` sem efeito prático (`await-thenable`) e proíbe atribuições inseguras derivadas de `any`.

#### 2. Segurança e Auditoria (SAST)

Foco em blindagem contra vulnerabilidades.

* **`eslint-plugin-security`:** Mapeia falhas comuns no Node.js. Bloqueia variáveis dinâmicas em `require()` (prevenindo injeção de código), sinaliza regex vulneráveis a travamento de CPU (ReDoS) e barra o uso de `eval()`.
* **`eslint-plugin-no-unsanitized`:** Essencial em projetos que manipulam DOM ou geram HTML dinâmico. Força a sanitização de inputs de usuários antes de injeções em funções como `innerHTML`, bloqueando ataques de XSS.

#### 3. Arquitetura e Grafo de Dependências

Evita bugs silenciosos de runtime.

* **`eslint-plugin-import-x`:** Fork otimizado do antigo `eslint-plugin-import`. A regra `import/no-cycle` é crítica para impedir dependências circulares que resolvem como `undefined` em runtime no Node. Ele também detecta arquivos e exports mortos (`no-unused-modules`).
* **`eslint-plugin-sonarjs`:** Analisa complexidade estrutural. Detecta blocos de código duplicados em condicionais isoladas e alerta sobre funções com complexidade cognitiva excessiva.

#### 4. Otimização de Código

* **`eslint-plugin-unicorn`:** Aplica padrões rigorosos de JavaScript moderno. Força a substituição de regex globais por `replaceall`, corrige o uso ineficiente de métodos de Array e elimina redundâncias de sintaxe.
