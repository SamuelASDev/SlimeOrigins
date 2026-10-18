# Inventário, equipamentos e economia de moedas

## Jogar

- **I · Inventário**: arma, armadura e acessório no personagem, mochila de equipamentos e mercador.
- **H · Habilidades**: cada cópia ocupa uma célula da mochila. Clique num slot, selecione uma cópia e use **Alocar**; também é possível arrastar a cópia para o slot. Três slots e seis pontos de magia. Não é possível alocar duas cópias da mesma habilidade ao mesmo tempo.
- **F · Fusão**: prévia do resultado e dos ingredientes, confirmação explícita e busca de pares para evolução. Apenas cópias livres e sem favorito podem ser consumidas. Duas iguais e do mesmo nível evoluem até nove; tipos diferentes seguem o livro de receitas e herdam o menor nível dos ingredientes.
- **★ Favorito**: protege a cópia contra venda e fusão. Não impede seu uso no personagem.

A cópia exata alocada define o poder. Obter outra cópia mais forte não troca sua build. Itens equipados não podem ser vendidos ou fundidos; desequipe-os primeiro. Slots e favoritos permanecem ao recarregar.

Kaijin fabrica cópias na mochila. O nível da oficina determina o nível do equipamento (1–3). Os três tipos compartilham o custo de `8 × nível` magiminérios e `5 × nível` fibras. Fabricar não equipa automaticamente. Núcleo ofensivo dá 8% de ataque por nível, revestimento dá 5% de defesa e talismã dá 3% de ritmo e 0,35 vida/s por nível. Cópias guardadas não somam bônus.

## Moeda do jogo

Cada abate rende duas moedas, inclusive na expedição offline. Após fundar a vila, o mercador permite:

- Vender uma cópia de habilidade por `8 × nível²` moedas.
- Vender um equipamento por `20 × nível²` moedas.
- Comprar Carapaça, Instinto caçador ou Regeneração de nível 1 por 80 moedas cada.
- Comprar um pacote de cinco materiais por 30 moedas.

Vender exige selecionar uma cópia e confirmar o preço. Equipados e favoritos são protegidos. Uma venda não pode consumir a mesma instância duas vezes. O registro de descoberta permanece após vender a última cópia, mas a habilidade só pode ser equipada enquanto existir um item disponível. Não há venda em lote nesta entrega.

## Saves e identidade

Save v4: `skillSlots` guarda IDs das cópias alocadas; `equipment` contém itens e slots de arma/armadura/acessório; `coins` guarda a moeda. `equipped` continua como índice de tipos utilizado pelo combate.

Cada item tem ID numérico local, `instanceId` UUID, origem, favorito e IDs dos pais quando criado por fusão. A migração preserva os itens anteriores, aloca a melhor cópia das habilidades da antiga build e converte os níveis de componentes antigos em equipamentos já equipados, sem duplicar bônus. UUIDs e IDs duplicados em dados de entrada são reparados.

Exportação/importação inclui a nova estrutura. Há restauração por arquivo ou texto, com confirmação dentro do jogo.

## Limite da negociação

O sistema atual é uma economia local com mercador NPC, usando exclusivamente moeda do jogo. Trocas entre jogadores e leilão ainda não foram implementados. UUID e origem ajudam a identificar instâncias, mas saves locais são editáveis: não constituem garantia de propriedade, autenticação ou prevenção de duplicação entre contas. Um mercado entre jogadores exige servidor autoritativo, contas, inventário transacional, transferência atômica de item e moeda, validação de origem e registro de negociações. Nenhum pagamento com dinheiro real foi adicionado.

## Validação

Testes de regras cobrem slots exatos, capacidade, substituição de cópias, bônus por equipamento alocado, proteção de equipados/favoritos, prévia sem mutação, linhagem de fusão, venda única, saldo insuficiente, fabricação e migração idempotente.

Para criar dados de demonstração: `node --experimental-strip-types scripts/create-inventory-demo.mjs`. O arquivo é gerado em `tmp/inventory-demo.json`, ignorado pelo Git. Importe na origem de teste `localhost`, separada do save de `127.0.0.1`.

### Teste de interface no Edge

Verificado na origem `localhost:5173`, com dados de demonstração separados do save real em `127.0.0.1:5173`: restauração por texto e migração de componentes, slots de equipamento, alocação da cópia de nível 1 enquanto outra de nível 5 permanece na mochila, favorito persistido e excluído da fusão/venda, prévia e execução de Corpo adaptativo, venda com confirmação e acréscimo exato de oito moedas, compra de habilidade e materiais, fabricação de talismã sem equipar automaticamente e equipamento preservado após recarregar. Busca e filtro de favoritos também foram conferidos. Nenhum erro de console foi encontrado durante o fluxo. O arraste foi implementado, mas não foi exercitado nessa verificação; a alocação por clique foi testada.

A importação por arquivo ficou bloqueada pela configuração da extensão do Edge, então a verificação usou a alternativa por texto. As confirmações de restauração agora aparecem dentro do jogo, evitando caixas nativas que bloquearam uma aba de teste. Captura em [inventario-equipamentos-v4.jpg](imagens/inventario-equipamentos-v4.jpg).
