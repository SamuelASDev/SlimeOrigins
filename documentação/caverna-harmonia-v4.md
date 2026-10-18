# Composição e escala da caverna

A caverna recebeu uma composição própria para os sete setores, preservando a progressão e os corredores conectados.

- Nascentes: água rasa de 240–290 pixels de largura, com pequenos grupos de hipokute nas margens.
- Galeria: formações de magiminério de 46–68 pixels, concentradas em pontos definidos.
- Ninho: três formações de teias de 76–100 pixels nas laterais, deixando o centro disponível para a caça.
- Abismo: menos formações minerais e uma área central mais limpa para o desafio.
- Carapaças: depósitos separados, com espaço entre os pilares e os monstros grandes.
- Selo: minerais discretos, selo assentado no chão e Veldora com a proporção original da imagem.

O slime continua com largura neutra de 36 pixels. Plantas usam 24–34, minerais 42–68 e pilares 92–104. Os pilares foram aproximados para formar uma moldura mais legível ao redor da sala, com suas posições visuais e colisões alteradas juntas. As rotas continuam alcançáveis. Os lagos são águas rasas caminháveis, como na exploração anterior.

Os props da caverna passaram a ter metadados independentes em `public/assets/sprites/cave-props-v3.json`: a origem de cada formação corresponde à própria base, sem compartilhar a dimensão lógica de outros objetos. A imagem existente `cave-decor-v2.png` foi preservada integralmente. `scripts/build-cave-props.py` reproduz esses metadados sem editar a arte.

O terreno é desenhado também sob os pilares, evitando buracos quadrados. Paredes têm sombras e bordas mais suaves; uma trilha de desgaste, marcadores discretos e números das salas indicam o percurso. Elementos altos usam a mesma ordenação por posição dos personagens. A imagem de Veldora mantém sua razão de aspecto em vez de ser esticada para uma dimensão fixa.

A geometria continua sendo desenhada uma vez em blocos. Uma pequena sobreposição nas bordas e filtragem de pixel eliminam frestas entre esses blocos no zoom fracionário da câmera.

## Verificação

74 testes passaram, incluindo rotas entre todos os setores, colisões com os novos pilares, separação das formações, escala dos elementos e integridade dos recortes originais. Build de produção aprovado, com o aviso conhecido sobre tamanho do bundle Phaser.

No Edge, em `localhost`, foram conferidos a sala inicial, a escala em relação ao slime e aos morcegos, a nascente, os pilares e a retomada do combate. Nenhum erro foi registrado no console durante essa conferência.

![Caverna revisada](imagens/caverna-harmonia-v4.jpg)
