# Ícones, caravana de Myourmiles e menus independentes

## Arte

A ferramenta integrada `image_gen` gerou os novos assets em `public/assets/sprites/`:

- `icons-skills-anime-v1.png`: 24 ícones individuais de habilidades, atlas 6 × 4.
- `icons-items-anime-v1.png`: nove variantes de equipamento (arma, armadura e talismã nos níveis 1–3), materiais, moedas e objetos de comércio, atlas 4 × 4.
- `npc-myourmiles-anime-v1.png` e `.json`: quatro poses do mercador em pixel art anime.

Os prompts e refinamentos estão em [prompts-icones-mercador.json](prompts-icones-mercador.json). O estilo segue as folhas anime já existentes. Os PNGs são preservados; os ícones usam coordenadas CSS no atlas e o personagem usa metadados Phaser. Nomes e descrições continuam disponíveis independentemente da imagem.

O mercador escolhido é Myourmiles/Mjollmile, apresentado como comerciante na [página oficial do personagem](https://www.ten-sura.com/character/mjollmile). A fala, a caravana e as regras de estoque são adaptações do jogo.

## Comércio somente na vila

O inventário passou a cuidar apenas de equipamentos. Para comprar ou vender, visite a vila e clique em Myourmiles perto das barracas, ou no botão **Myourmiles · Mercador**. É preciso fundar a vila. Tanto os controles quanto as regras de compra/venda verificam o contexto da visita.

A caravana renova a cada 15 minutos, em janelas fixas do relógio, e apresenta:

- Três habilidades de nível 1, com três unidades por oferta e preço de 80 moedas.
- Quatro pacotes de cinco materiais, com quatro unidades por oferta e preço de 30 moedas.
- Duas ofertas de equipamento, com uma unidade cada. Tipos e níveis variam; o preço é quatro vezes o valor de venda.
- Uma habilidade de nível 2 ou 3, com uma unidade e preço quatro vezes maior que seu valor de venda.

A lista de habilidades e os tipos de equipamento mudam conforme a janela. O relógio regressivo permanece visível. Quantidades consumidas ficam no save: recarregar não reabastece. Ofertas expiradas são rejeitadas. Um relógio que retrocede não reabre o estoque anterior. A renovação acontece com a loja aberta, preservando a posição de leitura. O protótipo usa o relógio e o save locais; uma futura economia entre contas precisa de autoridade no servidor.

## Combate e interface

Antes, cada abate executava `renderMenus()`, reconstruindo mochilas, seletores e detalhes de todos os painéis. Restaurar somente a rolagem externa não preservava as listas internas nem os controles em uso.

Agora:

- A simulação continua executando combate, progressão, loot e save independentemente dos menus abertos.
- Recompensas atualizam somente textos de contadores e o aviso de novas cópias. Os nós da lista, seleção, busca e seletores de fusão permanecem intactos.
- O aviso ocupa uma área de altura fixa. Novas cópias já pertencem ao inventário; **Mostrar novos itens** atualiza a lista quando o jogador decide. Abrir novamente também mostra o estado atual.
- Apenas o painel aberto é montado ao abrir ou realizar uma ação que precise atualizar seu conteúdo.
- Renderizações intencionais preservam a rolagem externa e interna, o foco de campos de texto e seções expansíveis.
- Abrir menus, negociar, fabricar, buscar e proteger favoritos não reiniciam os temporizadores de habilidades.
- O diário mantém a posição de leitura ao inserir novas mensagens.

A visita à vila continua sendo uma mudança para a zona segura, onde a caça é suspensa, como no comportamento anterior. Abrir inventário, habilidades, síntese, diário ou opções durante a caça não suspende a simulação.

## Verificação

- `npm test`: 44 testes aprovados, incluindo cobertura de todos os ícones, persistência e esgotamento do estoque, renovação, ofertas expiradas, relógio regressivo e bloqueio de comércio fora da vila.
- `npm run build`: TypeScript e produção aprovados. Permanece o aviso conhecido de tamanho do pacote Phaser.
- Edge, origem de demonstração `localhost:5173`: os abates avançaram de 102 para 104 enquanto a rolagem interna ficou em **510 px**, a externa em **249 px** e a cópia **#60** permaneceu selecionada. Uma nova cópia foi recebida e indicada sem reconstruir a lista.
- O clique no sprite de Myourmiles abriu a loja. Comprar magiminério reduziu de 4/4 para 3/4 e persistiu após recarregar.
- Uma renovação real com a loja aberta mudou a oferta `1991490:rune-0` para `1991491:rune-0`, reiniciou a contagem para a próxima janela e reabasteceu o material para 4/4.
- A compra de um talismã consumiu sua única unidade, marcou a oferta como esgotada e entregou a cópia na mochila. O esgotamento persistiu após recarregar. Nenhum erro de console foi encontrado.

[Captura do mercador na vila](imagens/myourmiles-caravana.jpg).
