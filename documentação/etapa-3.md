# Etapa 3 — vila integrada

Entrega revisada: a vila é uma cena própria de 2.400 × 1.600 unidades, aberta por **V** ou pelo botão Vila. Arrastar com o mouse ou toque move a câmera pelos limites do mapa. Clicar nas construções abre a administração daquele local; arrastar não conta como clique. Os botões inferiores também permitem localizar as construções e centralizar o mapa. **Voltar à caça**, **V** ou as abas de região retornam ao combate.

Não existem monstros nem simulação de combate na vila. A cena de caça dorme enquanto ela é visitada e retoma ao retornar. Não há recompensa de caça durante a visita. O acampamento é uma adaptação de gameplay inspirada na formação de uma comunidade; o artesão é um personagem genérico deste protótipo.

## Ciclo implementado

Caçar → recolher provisões e materiais → estabelecer acampamento → construir e recrutar → fabricar componentes e preparar tônicos → voltar à caça com benefícios.

Fundação exige dez abates e concede uma única remessa de 24 madeira, 12 magiminério, 12 fibras e 12 hipokute. Materiais começam a ser recolhidos antes da fundação. O artesão goblin exige vinte abates e o acampamento fundado; seu recrutamento ocorre uma vez.

## Construções

| Construção | Benefício por nível | Função |
| --- | --- | --- |
| Oficina | +4% de defesa | Com o artesão, fabrica e aprimora componentes assimilados |
| Laboratório | +2 pontos percentuais de absorção, +5% de velocidade de ataque | Favorece coleta de duplicatas; preserva as fusões existentes |
| Alquimia | +0,75 vida/s | Prepara tônico de vitalidade |

Cada construção tem três níveis. Os custos aumentam proporcionalmente ao próximo nível. Não há timers de construção ou perda por falha.

## Materiais e fabricação

A madeira representa coleta feita durante as rotas, uma unidade por abate. Não é apresentada como um item que cai do corpo do monstro. Aranhas, morcegos e mariposas fornecem fibras; Armorsaurus, besouros e centopeias fornecem magiminério; as demais rotas fornecem hipokute. São regras de economia do jogo, não drops canônicos.

O artesão fabrica um **Núcleo ofensivo** (+8% de ataque por nível) e um **Revestimento corporal** (+5% de defesa por nível). Ambos vão até +3, limitados ao nível da Oficina, usando magiminério e fibras. São assimilados automaticamente pelo slime; ainda não há inventário de armas, raridades, troca de equipamentos ou aparência humanoide.

O tônico custa oito hipokute e concede +3 vida/s por dez minutos reais. Não acumula, não renova antecipadamente e seu vencimento fica salvo. O tempo continua passando fora da aba; isso não concede recompensas offline de caça.

## Persistência e limites

A vila é um campo aditivo do save v3. Saves anteriores recebem uma vila vazia e mantêm personagem, habilidades, moedas, setor e build. Marcos antigos de abates contam para fundar e recrutar, mas não geram retroativamente materiais de caça. A remessa inicial permite começar imediatamente. Durante desafios de chefe, construção, recrutamento, fabricação e preparação ficam bloqueados.

O cenário usa a arte do acampamento como mapa, com câmera independente e regiões interativas sobre as três construções. Não há movimentação manual do personagem ou colocação livre de prédios nesta entrega. Melhorias e fabricação abrem ao clicar no prédio. Arte gerada com `image_gen.imagegen`, preservada em `public/assets/sprites/village-camp.png`; prompt em [prompt-vila.json](prompt-vila.json).

## Validação

23 testes e build passaram. Testes novos cobrem marcos e concessão única, coleta, bônus de absorção, cobrança de materiais, limites de prédios/equipamentos, requisitos de artesão, tônico e persistência. O ciclo usa os mesmos efeitos de combate do restante do jogo.

A revisão do mapa foi conferida no navegador: entrada na cena segura, câmera por arrasto, distinção entre arrastar e clicar, abertura da Oficina pelo próprio cenário e retorno à caça. A vila reaproveita a arte existente como cenário navegável, sem novas imagens geradas nesta revisão.

Próxima etapa prevista: versão vertical — tutorial guiado, áudio e controles de efeitos, exportação/importação de save e progresso offline com relatório e concessão única. Expansões de moradores e equipamentos completos vêm depois de validar este ciclo.
