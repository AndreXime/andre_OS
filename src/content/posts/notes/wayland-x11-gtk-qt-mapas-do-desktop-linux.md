---
id: 23
slug: "wayland-x11-gtk-qt-mapas-do-desktop-linux"
type: note
title: "Wayland, X11, GTK e Qt: mapa das camadas do desktop Linux"
description: "Display server, toolkit e ambiente de desktop são camadas distintas. Entender onde cada peça encaixa evita escolha errada e bugs de integração."
tags: ["Linux","Wayland","GTK","Qt"]
featured: false
date: 2026-06-12
---

Escolher **GNOME**, **KDE Plasma** ou **XFCE** parece decisão de tema e atalhos. Na prática, você está empilhando três camadas: **display server** (quem fala com GPU e input), **toolkit** (como apps desenham widgets) e **desktop environment** (shell, settings, apps padrão). Confundir essas camadas gera expectativa errada sobre compatibilidade, consumo de RAM e por que um app Qt "estranho" no GNOME não é bug isolado.

### Display server: X11 e Wayland

O **display server** é o protocolo entre compositor, janelas e hardware gráfico.

**X11** (X.Org) nasceu nos anos 80 com servidor centralizado e clientes remotos. Janelas pedem ao X server; qualquer processo com acesso ao socket X pode ler teclas de outro app. Segurança e sincronização de composição ficaram remendos (`compositing manager`, extensões). Ainda domina legado: screen sharing caprichoso, drivers antigos, apps que assumem `xrandr` e `_NET_WM_*`.

**Wayland** simplifica o modelo: o **compositor** é dono do framebuffer e do input. Apps recebem buffers prontos; não há "janela X" global para terceiros espionarem. Ganha-se tearing menor, gestos nativos e caminho limpo para HiDPI. Programas antigos feitos para X11 ainda rodam via **XWayland**, uma camada de compatibilidade dentro da sessão Wayland. Abrir o app costuma funcionar; já gravar tela, compartilhar janela em videoconferência ou usar ferramentas que controlam outras janelas pedem permissão explícita ao sistema, e cada desktop implementa isso de um jeito. No X11 essas funções eram mais soltas por padrão.

Na sessão atual, `echo $XDG_SESSION_TYPE` retorna `wayland` ou `x11`. Isso define capacidades reais do sistema, não só o nome do menu de login.

### Toolkit: GTK e Qt

**GTK** e **Qt** são frameworks de UI: widgets, tema, acessibilidade, integração com file picker e notificações.

**GTK** (C, bindings em Python/Rust/etc.) é a stack do ecossistema **GNOME**. Apps GTK seguem **Libadwaita** no GNOME 40+: uma lib visual, menos "bring your own theme". Fora do GNOME, GTK ainda roda, mas header bars, client-side decorations e preferências de tema podem divergir.

**Qt** (C++, QML) sustenta **KDE Plasma** e muitos apps cross-platform (VLC, OBS, Telegram desktop). Qt traz próprio estilo (Breeze), engine de ícones e abstração multiplataforma. KDE Plasma no Wayland é referência madura; Qt 6 consolidou suporte Wayland nativo.

Toolkits não são DEs. **Firefox** e **Chromium** usam toolkits próprios; **Electron** empilha Chromium. Um sistema pode rodar app Qt no GNOME e app GTK no Plasma sem contradição técnica, só inconsistência visual.

### Desktop environment: o pacote completo

**DE** = compositor + painel + settings + apps default + convenções (tipos MIME, atalhos, políticas de energia).

| DE | Compositor típico | Toolkit base | Perfil |
|----|-------------------|--------------|--------|
| **GNOME** | Mutter (Wayland default) | GTK / Libadwaita | Fluxo simples, pouca customização, mobile-like |
| **KDE Plasma** | KWin | Qt | Altamente configurável, feature-rich |
| **XFCE** | Xfwm (X11 tradicional; Wayland em progresso) | GTK | Leve, familiar, desktop clássico |
| **LXQt** | Openbox ou compositor leve | Qt | Sucessor espiritual do LXDE, mínimo de RAM |
| **MATE** | Marco (fork Metacity) | GTK | GNOME 2 preservado, X11-first |
| **Cinnamon** | Muffin (fork Mutter) | GTK | GNOME-like com bandeja e menu tradicional |

**Cinnamon** e **MATE** nasceram da reação ao GNOME 3: mantêm paradigma de menu, bandeja e janelas clássicas. **XFCE** e **LXQt** competem no nicho "máquina velha ou servidor com monitor": menos animação, menos daemon em background.

Nenhuma DE impede instalar apps de outra stack. O atrito é integração: tema escuro inconsistente, title bar diferente, portal de arquivo errado no Wayland.

### WM sozinho vs DE

**i3**, **Hyprland**, **Sway** são **window managers** ou compositors tiling, não DEs completos. Entregam layout de janelas e atalhos; painel, polkit, rede e brilho você monta (`polybar`, `waybar`, scripts). Trade-off explícito: controle total e boot rápido versus horas de config e gaps em laptop (suspend, Wi-Fi, Bluetooth).

**Sway** é i3-like no Wayland; **Hyprland** adiciona animações e regras dinâmicas sobre wlroots. São escolhas de quem trata desktop como código versionado, não produto acabado.

### O que usar como usuário comum

Se você só quer instalar e usar, fique no **desktop padrão da distro**. Fedora e Ubuntu recentes entregam **GNOME** no Wayland: sessão estável, updates alinhados, menos decisão técnica. Quer menu tradicional, bandeja cheia e sliders em todo lugar? **KDE Plasma** (Kubuntu, openSUSE ou `plasma-desktop` na mesma base) é o caminho mais direto.

**XFCE** e **LXQt** fazem sentido em PC com pouca RAM ou CPU antiga: interface clássica, menos efeitos, boot mais leve. **Cinnamon** e **MATE** agradam quem sentiu falta do GNOME 2: barra inferior, menu em árvore, bandeja sem gambiarra.

Evite **i3**, **Hyprland** e **Sway** como primeiro Linux. Exigem montar painel, rede, brilho e permissões na mão; o retorno só aparece se você gosta de configurar o ambiente.

Na tela de login, se existir opção **Wayland** e **X11**, tente Wayland primeiro. Se algum app específico falhar (compartilhamento de tela antigo, software corporativo legado), volte para X11 naquela sessão. Não precisa entender GTK ou Qt: apps mistos funcionam; diferença visual entre app nativo GNOME e app Qt no mesmo desktop é normal.

Trocar de DE no meio da instalação costuma gerar pacote duplicado e tema inconsistente. Mais simples: escolher spin ou flavor certo na instalação (Kubuntu, Xubuntu, Linux Mint Cinnamon) do que empilhar ambientes depois.
