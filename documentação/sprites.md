# Sprites — referência e integração

## Direção visual

Referência definida pelo usuário: `Sprites/Folha de Sprites de Slimes Azuis.png`.

Pixel art de RPG anime com silhuetas arredondadas, contorno azul-marinho escuro, cores vivas, brilho e sombras em grupos de pixels. O arquivo fornecido já contém transparência; o original é preservado, sem alterações.

## Slime

- O jogo carrega uma cópia idêntica em `public/assets/sprites/slime.png`.
- Atlas JSON recorta 15 poses da folha irregular, sem repintar nem regravar seus pixels.
- Animações de repouso, deslocamento, ataque e reação a dano; há também uma pose de alegria preparada no atlas.
- O retrato do HUD usa a mesma folha original.

## Monstros

Folhas geradas individualmente com a ferramenta integrada `imagegen`, usando a folha do slime como referência de estilo. Não foi usado fallback CLI.

| Arquivo | Personagem |
| --- | --- |
| `beetle-anime-v2.png` | Besouro de musgo verde com carapaça brilhante e olhos âmbar. |
| `snake-anime-v2.png` | Serpente violeta com escamas e presas venenosas. |
| `wolf-anime-v2.png` | Lobo prateado com pelagem azulada. |
| `mushroom-anime-v2.png` | Cogumelo vital de chapéu coral e pintas claras. |
| `moth-anime-v2.png` | Mariposa azul-lavanda com padrões de bruma. |
| `frog-anime-v2.png` | Sapo turquesa com ventre claro. |
| `wisp-anime-v2.png` | Vaga-lume dourado com abdômen luminoso. |
| `bat-anime-v2.png` | Morcego rubro de asas carmesim. |
| `guardian-anime-v2.png` | Guardião besouro com placas de pedra, musgo e olhos âmbar. |

Todos ficam em `public/assets/sprites/`, acompanhados por atlas `.json`. Cada monstro tem quatro quadros: neutro, locomoção, preparação e ataque. As folhas preservam o canal alfa gerado.

Os prompts completos de geração ficam em `prompts-sprites-anime-v2.json`, incluindo a especificação compartilhada e o prompt de cada criatura.

## Integração

- Phaser carrega PNG + atlas, com filtro nearest-neighbor para preservar pixels.
- Atlas com trim e origem comum alinham os quadros sem precisar criar uma nova imagem recortada.
- Tamanho de cada criatura é calibrado pela pose neutra; o chefe é maior.
- Movimento espelha a direção horizontal. As folhas atuais não incluem oito direções de visão.
- Ataques acionam a animação correspondente, dano aplica reação visual e sombras de contato acompanham os personagens.
- A pausa também suspende as animações.
- O cenário continua sendo o cenário provisório da clareira; esta entrega substitui os personagens e monstros.

## Atualização dos atlas

Com Python e Pillow disponíveis:

```powershell
python scripts/build_sprite_atlases.py --variant anime-v2
```

O script apenas lê os PNGs e escreve metadados JSON. Não redimensiona, repinta ou altera as imagens. Os recortes do slime são explícitos; os monstros usam suas quatro células.

Os testes de assets verificam existência, dimensões, limites dos recortes e igualdade binária entre o slime servido e o original fornecido.

## Verificação da integração inicial

- `npm test`: nove testes aprovados, incluindo os dois testes de assets.
- `npm run build`: tipos e build de produção aprovados, com todas as imagens copiadas para `dist/assets/sprites/`.
- Edge: slime original e oito espécies renderizados com transparência, retrato atualizado, troca de poses, combate, pausa e retomada verificados.
- Guardião renderizado em escala maior, desafio concluído com vitória e retirada posterior funcionando.
- Nenhum erro ou aviso de console capturado após recarregar a versão com os assets completos.
- Capturas: [sprites no mapa](imagens/sprites-integrados.png) e [slime com guardião](imagens/guardiao-sprite.png).

## Revisão anime e combate

O conjunto ativo agora usa os arquivos `*-anime-v2.png`, mantendo os anteriores. Os quatro quadros são neutro, locomoção, preparação e ataque. O alinhamento considera a massa visual do corpo para reduzir saltos entre as poses.

Doze testes aprovados na revisão; detalhes de funcionamento e validação em [combate-visual.md](combate-visual.md). Prompts da revisão em [prompts-sprites-anime-v2.json](prompts-sprites-anime-v2.json).
