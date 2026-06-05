---
id: 21
slug: "sincronizar-estado-web-app-com-hash-na-url"
type: note
title: "Sincronizar estado entre dispositivos sem backend: hash na URL"
description: "localStorage não cruza dispositivos. Comprimir JSON no fragmento da URL (#state=) transfere snapshot de estado sem servidor, sem query string e sem exportar arquivo."
tags: ["Desenvolvimento Web","localStorage","TypeScript"]
featured: false
date: 2026-06-05
---

**localStorage** resolve persistência no mesmo navegador, mas não sincroniza celular com notebook. Para ferramentas client-only (planejadores, editores, cadernos), subir um backend só para copiar JSON entre dispositivos é custo desproporcional. A saída pragmática: serializar o estado da aplicação, comprimir, colocar no **hash** da URL e restaurar quando alguém abrir o link.

### Por que hash e não query string

A query (`?foo=bar`) vai na requisição HTTP. Proxies, logs de CDN e servidores antigos tratam ~2 KB como teto prático. O **fragmento** (`#...`) fica no cliente: o browser não envia o hash ao servidor. Browsers modernos aceitam dezenas de KB no fragmento sem problema.

| Parte | Vai ao servidor? | Uso típico |
|-------|------------------|------------|
| `?state=...` | Sim | Filtros, UTM, deep links server-side |
| `#state=...` | Não | Snapshot de estado client-only |

Para transferir estado entre dispositivos, o hash é o canal certo.

### Pipeline de encode

O fluxo é linear: ler o estado, serializar, comprimir, codificar, montar o link.

```text
estado da app → JSON → deflate → base64url → #state=<token>
```

Envolva o payload com metadados mínimos. Um campo de versão (`v`) permite evoluir o formato. Um identificador de app (`app`) impede que um link de planejador seja aberto no editor errado:

```json
{
  "v": 1,
  "app": "planejador-semanal",
  "data": {
    "plan": {
      "mon": [{ "id": "1", "title": "Reunião", "start": "09:00", "end": "10:00" }],
      "tue": []
    }
  }
}
```

A compressão e a codificação podem usar APIs nativas do browser:

```typescript
const jsonString = JSON.stringify(payload);
const compressed = new Blob([jsonString])
  .stream()
  .pipeThrough(new CompressionStream("deflate"));
const buffer = await new Response(compressed).arrayBuffer();

// base64url: troca +/ por -_, remove padding =
const token = btoa(String.fromCharCode(...new Uint8Array(buffer)))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=+$/, "");

const url = new URL(window.location.href);
url.hash = new URLSearchParams({ state: token }).toString();
```

**deflate** costuma reduzir JSON repetitivo (listas, chaves duplicadas) em 60-80%. **base64url** evita caracteres que quebram ao colar em chat ou e-mail.

O botão "Copiar link" só chama esse pipeline e manda o resultado para o clipboard.

### Import na abertura da página

Quem recebe o link abre a mesma rota da ferramenta, mas com `#state=...` no final. Na inicialização da página:

1. Ler `window.location.hash`
2. Extrair o token, decodificar base64url, descomprimir, fazer `JSON.parse`
3. Validar `v` e `app`
4. Gravar em `localStorage` (ou no store da UI) e limpar o hash com `history.replaceState`

Limpar o hash após importar evita reprocessar o mesmo estado a cada refresh.

### Sanitizar na entrada

Estado vindo de link é **entrada externa**. O mesmo código que valida dados ao ler `localStorage` deve rodar no import. Se você já tem uma função que normaliza JSON cru antes de usar na UI, reutilize-a:

```typescript
function applyImportedState(raw: unknown) {
  const safe = normalizePlan(raw); // mesma função do decode do localStorage
  savePlan(safe);
}
```

Regras que valem para os dois caminhos:

- Campo ausente → valor default
- Tipo errado → descarta ou corrige
- Item inválido em lista → filtra

Pular essa etapa no import é convite para link adulterado ou payload de versão antiga quebrar a interface.

### Onde não usar

Isso é **transferência de snapshot**, não sync em tempo real. Não substitui WebSocket, CRDT ou backend com merge.

Limites reais:

- **Tamanho**: após compressão, ~64 KB na URL completa é teto prático. Acima disso, apps de mensagem truncam links ao colar.
- **Binário inline**: fotos em base64 dentro do JSON explodem o payload. Estado com mídia pede backend ou export seletivo (só metadados no link).
- **CompressionStream**: exige browser recente. Sem polyfill, falha no encode/decode.
- **Privacidade**: o estado fica visível para quem recebe o link. Não coloque segredos no payload.

### Organização no código

Separe responsabilidades em três peças reutilizáveis:

- **Persistência local**: leitura/escrita em `localStorage` com normalização no decode
- **Serialização de link**: encode/decode do hash, limite de tamanho, validação do envelope
- **UI**: botão de copiar e detecção de hash no mount da página

Cada ferramenta define seu schema de `data`. A camada de link não precisa conhecer campos internos; só transporta o JSON que a app já sabe interpretar.

O ganho não é elegância de protocolo. É eliminar atrito: usuário copia um link no desktop, abre no celular, estado idêntico sem conta, sem API e sem arquivo `.json` intermediário. Para web apps utilitários que vivem no `localStorage`, essa é a fronteira entre "só neste dispositivo" e "levo para qualquer lugar".
