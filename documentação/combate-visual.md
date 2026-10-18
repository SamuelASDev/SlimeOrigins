# Revisão visual — anime pixel e ataques

## Direção

As oito espécies e o guardião receberam novas folhas com poses de batalha mais marcadas, contornos angulares, sombreamento em blocos de pixels e proporções de monstros de JRPG anime. O slime original do usuário foi preservado.

Assets ativos: `public/assets/sprites/*-anime-v2.png`, com atlas correspondentes. As versões anteriores continuam disponíveis. `src/asset-paths.ts` seleciona o conjunto ativo. Geração realizada com ImageGen integrado; prompts em [prompts-sprites-anime-v2.json](prompts-sprites-anime-v2.json).

## Problema corrigido

Antes, o inimigo trocava brevemente de quadro e o dano era aplicado no início da animação. As mesmas poses também apareciam no repouso, reduzindo o contraste visual do ataque.

Agora cada golpe tem preparação, execução, impacto e recuperação. As poses de preparação e execução não entram no ciclo de repouso. O slime também prepara o ataque básico antes de causar dano.

## Ataques por criatura

| Criatura | Ataque visual |
| --- | --- |
| Besouro | Recuo curto e investida de corpo. |
| Serpente | Recolhe o pescoço e lança projétil violeta. |
| Lobo | Agacha, avança e abre três cortes de garra. |
| Cogumelo | Comprime o corpo e lança esporos em trajetória ondulada. |
| Mariposa | Recolhe as asas e dispara uma rajada de bruma. |
| Sapo | Infla a garganta e dispara água. |
| Vaga-lume | Carrega energia e lança uma descarga angular. |
| Morcego | Recolhe as asas e avança com mordida. |
| Guardião | Planta as patas, avança com golpe pétreo e mantém o impacto sísmico anunciado. |

Efeitos são desenhados com grupos de pixels no Phaser: rastros curtos, garras, descarga e faíscas de impacto. A direção acompanha o alvo, inclusive quando o monstro precisa se virar para a esquerda.

## Regras de execução

- Dano ocorre na chegada do golpe, uma única vez.
- Ataques à distância lançados continuam após a morte do emissor; preparação interrompida por morte não lança o projétil.
- Ataques de corpo a corpo são cancelados se o monstro morrer antes do impacto.
- O destino fica fixo após o disparo: deslocamento suficiente pode evitar o golpe.
- A posição lógica do inimigo fica separada do deslocamento visual da investida, evitando que a animação altere o alcance ou cause deriva.
- O impacto não cancela uma animação de ataque já em execução do slime; a reação usa brilho e partículas.
- Pausa congela combate, animações, efeitos, números e temporizadores.
- Mudança de encontro limpa golpes pendentes e efeitos, evitando danos de uma luta anterior.
- Painel de alvo indica preparação, ataque e recuperação.

## Verificação

- Testes de temporização cobrem liberação e impacto únicos, passos longos e ausência de avanço com delta zero.
- Testes de assets validam o conjunto ativo e preservação do slime original.
- No navegador, golpes do guardião e descarga do vaga-lume foram observados e congelados no impacto, com redução correspondente de vida.
- Retirada do chefe e retorno à caça verificados, sem erros de console capturados.
- Captura do impacto: [combate-anime-impacto.png](imagens/combate-anime-impacto.png).

As folhas têm quatro poses, não uma animação desenhada com dezenas de quadros. O movimento contínuo entre poses combina deslocamento, escala leve e os efeitos de combate. Balanceamento de longo prazo e arte do cenário continuam fora desta revisão.
