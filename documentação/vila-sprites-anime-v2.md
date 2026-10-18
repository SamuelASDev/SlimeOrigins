# Vila e moradores — sprites anime v2

Arte gerada pela ferramenta integrada `image_gen`, usando `wolf-anime-v2.png` como referência de estilo: contornos escuros, clusters de pixels, cores vivas e sombreamento cel shading. Os prompts completos ficam em [prompts-vila-anime-v2.json](prompts-vila-anime-v2.json).

## Assets utilizados pelo jogo

Todos estão em `public/assets/sprites/`:

- `village-tempest-anime-v2.png`: cenário opaco 1536 × 1024, com forja, salão, clínica/jardim, casas, mercado, fonte e ponte.
- `npc-kaijin-anime-v2.png`: Kaijin, mestre ferreiro anão, com martelo e avental.
- `npc-benimaru-anime-v2.png`: Benimaru com cabelo vermelho, chifres, kimono e katana.
- `npc-shuna-anime-v2.png`: Shuna com cabelo rosa, chifres, traje de sacerdotisa e ervas/poção.

Cada personagem possui quatro poses em grade 2 × 2: repouso, variação, trabalho e saudação, com fundo transparente. A animação da vila alterna essas poses lentamente. São animações de atividade no local, não folhas direcionais de caminhada.

As versões anteriores foram preservadas. O mapa antigo feito por retângulos deixou de ser renderizado. As marcações de nome, nível e clique permanecem no Phaser, separadas das imagens. As posições foram ajustadas às entradas visíveis no cenário gerado. A imagem do cenário é estática; apenas os moradores e marcadores têm animação nesta entrega.

## Metadados e reprodução

Execute `python scripts/build-village-atlases.py` após substituir uma folha. Requer Pillow e usa o gerador de atlas existente. O script verifica transparência e margens em cada célula e gera somente JSON; não modifica os PNGs. Os recortes são alinhados pelos pés e compartilham dimensões lógicas para manter a escala durante as poses.

`npm test` inclui verificação dos três novos atlas e das dimensões do cenário. `npm run build` verifica TypeScript e empacotamento. A inspeção visual foi realizada nas imagens geradas; a execução e os cliques no navegador ainda precisam de conferência manual, pois não há navegador conectado disponível neste ambiente.
