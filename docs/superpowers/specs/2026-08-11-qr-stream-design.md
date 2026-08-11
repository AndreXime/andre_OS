# Design: Transmissão óptica via QR (QrStream)

Data: 2026-08-11  
Status: aprovado em conversa; aguardando revisão do arquivo

## Objetivo

Ferramenta 100% client-side no hub andre_OS que transmite texto ou arquivo entre dois dispositivos via stream animado de QR Codes (tela → câmera), sem backend e sem canal de retorno (ACK).

## Escopo da v1

- Abas **Transmitir** e **Receber** na mesma tool
- Payload: texto livre **ou** arquivo binário
- Protocolo: loop linear com manifesto no frame 0
- Decoder: `BarcodeDetector` nativo com fallback `jsQR`
- Controles de desempenho: presets **Rápido / Confiável / Densidade alta** (sem números crus na UI)
- Registro completo da tool: pasta React + post Markdown + `case` em `src/pages/app/[slug].astro`

## Fora de escopo

- Fountain / LT codes
- ACK/NACK ou WebRTC
- Persistência / compartilhar estado via URL
- Limite rígido de tamanho (apenas aviso soft)

## Identidade no projeto

| Campo | Valor |
|-------|--------|
| Pasta / componente | `QrStream` |
| `target` | `QrStream` |
| `slug` | `transmissao-optica-qr` |
| `title` | `Transmissão óptica QR` |
| URL | `/app/transmissao-optica-qr/` |
| Storage | nenhum (estado efêmero de sessão) |

Seguir `tools.md`: entry com `ToolShell`, UI em `*View` / pastas internas, tokens e `toolUi.ts`, layout coluna até `lg`.

## Arquitetura

```
src/tools/QrStream/
  QrStream.tsx              # entry + ToolShell
  QrStreamView.tsx          # abas Transmitir | Receber
  domain/
    protocol.ts             # framing, manifesto, parse
    presets.ts              # mapeamento dos 3 presets
    transmitter.ts          # slicing + loop de render QR
    receiver.ts             # câmera + detect + buffer
    assemble.ts             # montagem ordenada do Uint8Array
  ui/
    TransmitPanel.tsx
    ReceivePanel.tsx
    ProgressStrip.tsx
```

Dependências novas: `qrcode` (encode no canvas), `jsqr` (fallback de decode). Tipagens `@types/qrcode` / `@types/jsqr` se necessário.

Fluxo:

```
[TX] payload → chunks + manifesto → QR loop @ FPS do preset
        │ (óptico)
        ▼
[RX] câmera → detect → Map<index, bytes> → assemble → texto ou download
```

## Protocolo

Cada frame é uma string: `INDEX|TOTAL|PAYLOAD`

### Frame 0 (manifesto)

`0|TOTAL|M|<base64(json)>`

JSON do manifesto (após Base64):

```ts
interface StreamManifest {
  v: 1;
  kind: "text" | "file";
  mime: string;
  name: string;
  bytes: number;
}
```

O prefixo literal `M|` no payload evita confundir manifesto com chunk de dados.

### Frames de dados (1 .. TOTAL-1)

`i|TOTAL|<base64(slice)>`

Índices de dados começam em 1. O frame 0 nunca carrega bytes do arquivo/texto; o conteúdo binário ocupa os frames restantes. `TOTAL = 1 + ceil(byteLength / chunkSize)`.

### Loop

O transmissor cicla `0 .. TOTAL-1` indefinidamente até o usuário parar. Sem fountain codes na v1.

### Parse no receptor

1. Split em no máximo 3 partes por `|` (ou parse robusto que preserve Base64 com `|` impossível: Base64 não usa `|`)
2. Validar `index`/`total` numéricos e coerentes
3. Se payload começa com `M|`, decodificar manifesto
4. Senão, decodificar Base64 → `Uint8Array` e guardar se índice novo
5. Progresso: `receivedChunks.size` vs `total` (incluindo manifesto quando recebido)
6. Completo quando todos os índices `0..total-1` existem; então montar payload na ordem `1..total-1` e aplicar manifesto

## Presets

| Preset | FPS | Chunk (bytes) | Papel |
|--------|-----|---------------|--------|
| Rápido | 15 | 120 | leitura fácil, sessão mais longa |
| Confiável | 10 | 180 | **default** |
| Densidade alta | 12 | 250 | payloads maiores, exige foco bom |

QR: `errorCorrectionLevel: 'L'`, `margin: 2`, `width: ~400`.

UI mostra só os nomes dos presets (segmented control), nunca FPS/chunk crus.

## UI

### Transmitir

- Textarea **ou** arquivo (mutuamente exclusivos; trocar um limpa o outro)
- Segmented control de preset
- Canvas do QR como âncora visual
- Iniciar / Parar
- Metadados discretos: total de chunks, frame atual, tamanho em bytes
- Aviso soft se payload ≳ 1–2 MB

### Receber

- `getUserMedia({ video: { facingMode: 'environment', frameRate: { ideal: 30 } } })`
- Preview de vídeo + `ProgressStrip` (recebidos / total)
- Opcional: indicação dos índices faltantes (lista curta ou contagem)
- Conclusão:
  - `kind: "text"` → textarea + copiar
  - `kind: "file"` → botão baixar com `name` e `mime` do manifesto
- Parar libera tracks da câmera

Layout: `flex-col` até `lg`; sem cards no hero da tool; classes de `toolUi.ts` e tokens do andre_OS.

## Erros e bordas

| Caso | Comportamento |
|------|----------------|
| Câmera negada | Mensagem clara; não trava a aba |
| Sem `BarcodeDetector` | Fallback `jsQR` em ImageData de canvas |
| Frame inválido / fora do protocolo | Ignorar |
| Payload vazio no TX | Não inicia |
| Manifesto incompatível (`v` ≠ 1) | Ignorar até manifesto válido ou reset |
| Mudança de `total` no meio | Preferir reset do buffer se incoerente |

## Testes e verificação

O repo não tem runner de testes hoje. Domínio deve ser funções puras (framing, assemble, parse de manifesto) fáceis de validar; na v1 a verificação é:

- Manual: texto curto desktop→celular; arquivo pequeno; browser sem `BarcodeDetector`
- Projeto: `npm run lint`, `npm run build`, post + `case` na rota

## Critérios de sucesso

1. Dois dispositivos no mesmo ambiente físico transferem texto e arquivo pequeno ponta a ponta
2. Progresso no RX sobe de forma monotônica com chunks únicos
3. Download preserva nome/mime do manifesto
4. Tool aparece em `/app/transmissao-optica-qr/` e na listagem de ferramentas
