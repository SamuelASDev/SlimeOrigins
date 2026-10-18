# Capítulo 01 — Caverna do Selo

> Registro da primeira implementação. A revisão atual está em [habilidades-itens-e-caverna-v3.md](habilidades-itens-e-caverna-v3.md), com sete setores, aranhas, chefe e inventário consumível.

Implementado em 17/10/2026. A primeira aba agora abre a caverna; a clareira anterior permanece na segunda aba. O save de habilidades, equipamentos, nível e recursos continua compatível.

## Pesquisa e adaptação

- [Sinopse oficial do episódio 1](https://www.ten-sura.com/anime/tensura/story/no1): o slime desperta, consome ervas e minérios, encontra Veldora preso pela Prisão Infinita e faz amizade com ele.
- [Sinopse oficial do episódio 2](https://www.ten-sura.com/anime/tensura/story/no2): continuidade do encontro e saída em direção ao mundo exterior.
- [Imagens do episódio 2 catalogadas pela comunidade](https://tensura.fandom.com/wiki/Category:Episode_2_Images): referências dos encontros com serpente, morcego e Armorsaurus.
- [Giant bat — enciclopédia da comunidade](https://tensura.fandom.com/wiki/Giant_bat): espécie da caverna e ondas ultrassônicas.
- [Resumo dos monstros da caverna, em japonês](https://www.shurigekijou.com/tensura-sealed-cave/): apoio para os nomes Evil Centipede, Black Serpent e Armorsaurus. Fonte secundária, não confundir com wikis de mods ou fanfiction.

A geografia de seis setores, a quantidade de inimigos, os números de dano e a rota são adaptações jogáveis. No anime, a amizade com Veldora ocorre antes da sequência de caça da saída; aqui a câmara fica no fim do percurso para servir de destino de exploração. Veldora não participa do combate. Ervas hipokute, água e cristais são elementos ambientais nesta entrega, ainda sem coleta ou economia própria. A representação visual foi gerada para o protótipo, não extraída do anime.

## Mapa e controles

4.096 × 1.280 unidades, contra 800 × 480 da clareira: 5,12 vezes a largura e 13,65 vezes a área total do mundo. Parte dessa área é pedra não transitável. Seis salas ligadas por corredores em zigue-zague:

1. Despertar subterrâneo: ervas e água, morcegos gigantes.
2. Lago dos ecos: morcegos gigantes.
3. Galeria de magiminério: centopeias malignas.
4. Ninho da serpente: serpentes negras.
5. Passagem das carapaças: Armorsaurus.
6. Câmara do selo: encontro amistoso com Veldora; Armorsaurus na entrada.

O botão Mapa abre uma janela dentro da tela do jogo. Escolher um setor inicia uma caminhada real pelos corredores. A opção de exploração automática avança após seis abates no setor; desmarcá-la mantém o farm local. A última sala permanece em farm. A câmera acompanha o slime com a mesma escala de combate, sem encolher o mapa inteiro para caber na tela. A sessão mantém o setor ao alternar as abas; recarregar a página reinicia a exploração na primeira sala, preservando a progressão do personagem.

Navegação em grade de 32 unidades com busca em largura; monstros só iniciam ataques com linha de visão. Feitiços também respeitam paredes. O desafio do guardião anterior usa a clareira, separado de Veldora.

## Combate e absorção

| Espécie | Habilidade disponível | Adaptação funcional |
| --- | --- | --- |
| Morcego gigante | Dreno vital | Reutiliza o conhecimento de morcego anterior; não é uma nova essência |
| Serpente negra | Hálito venenoso | Veneno aplicado pelo ataque básico, sem acumular com Presa venenosa |
| Centopeia maligna | Hálito paralisante | Atrasa o próximo ataque inimigo em 350 ms por golpe básico |
| Armorsaurus | Armadura corporal | Redução de 35%, sem acumular com outras carapaças |

Chance de absorção de 15%, garantida no oitavo fragmento, seguindo o sistema existente. Permanecem três espaços e seis pontos de capacidade. O dreno do morcego e a forma de aplicar o veneno/paralisia simplificam as habilidades para o idle. A aranha negra também faz parte da sequência inicial da obra e fica para uma ampliação do bestiário; esta entrega não pretende incluir todas as espécies da caverna.

## Arte e validação

Sprites novos: `public/assets/sprites/cave-snake.png`, `cave-centipede.png`, `cave-armorsaurus.png` e `veldora-cave.png`. Gerados com `image_gen.imagegen`; prompts em `prompts-caverna.json` e `prompt-veldora.json`. Raster preservado integralmente; atlas JSON apenas registra recortes e alinhamento dos quatro quadros. Morcego e slime usam os sprites anteriores.

Os testes verificam conexão de todos os pares de setores, percurso apenas em chão válido, bloqueio de linha de visão, limites do mapa, compatibilidade do save e não acúmulo das armaduras. Executar `npm test` e `npm run build`.
