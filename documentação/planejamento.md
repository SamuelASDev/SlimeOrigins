# Planejamento — RPG idle de Slime

Registro inicial: 17/10/2026.

## Decisões confirmadas

- Plataforma: navegador.
- Tecnologia: Phaser com TypeScript.
- Interface: estilo de idle clássico, com mapa ocupando toda a janela, HUD sobreposto e menus abrindo dentro da tela do jogo. Não usar estrutura de página com cartões externos ao mapa.
- Direção visual: pixel art, com personagem e monstros andando pelo mapa.
- Premissa: combate automático, chance de absorver habilidades de monstros, evolução e combinação de habilidades.
- Uma vila do jogador terá melhorias para liberar fusões, fabricação e aprimoramento de armas e armaduras, buffs e outros sistemas.
- Referência temática: That Time I Got Reincarnated as a Slime.
- As demais regras deste documento são propostas iniciais, sujeitas a prototipação e decisão.

## 1. Visão do jogo

Um RPG idle de exploração em que o jogador começa como um slime fraco e transforma aquilo que absorve em habilidades, formas e melhorias para uma nação de monstros. O personagem caça automaticamente; o jogador decide o que perseguir, como combinar poderes e como desenvolver a vila.

A promessa central: cada monstro pode representar uma nova possibilidade para o personagem e para a cidade. Uma criatura venenosa pode liberar uma build de veneno e uma pesquisa de antídotos. Uma carapaça pode virar defesa corporal ou material de oficina.

O diferencial é conectar caça, experimentação e construção da comunidade, sem reduzir a progressão a aumentos de ataque.

## 2. Referências pesquisadas

| Referência | Aplicação no projeto |
| --- | --- |
| [Tibia Idle](https://www.tibiaidle.com/) | Caça idle dentro de uma estrutura familiar de RPG. |
| [Base NTO Idle](https://tibiadevs.com/forums/topic/2188-base-nto-idle/) | O autor descreve seleção de regiões, personagem caçando sozinho e progresso offline. Referência próxima da ideia original. |
| [PKX Idle](https://tibiadevs.com/forums/topic/2265-%F0%9F%94%A5-pkx-idle-%F0%9F%94%A5-%E2%80%94-divulga%C3%A7%C3%A3o/) | Projeto que aproxima PokéTibia e auto hunt. |
| [The Slormancer](https://store.steampowered.com/app/1104280/The_Slormancer/) | Coleção de habilidades e equipamentos e liberdade para trocar builds; referência de RPG de ação, não de idle. |
| [Slime: ISEKAI Chronicles](https://www.bandainamcoent.com/games/isekai-chronicles) | Integra construção de Tempest e fortalecimento de moradores. |

Combinação desejada: leitura visual de Tibia, caça automática e progressão por absorção e experimentação.

## 3. Relação com o anime

Predador, Grande Sábio e formação de uma comunidade entre povos são boas bases para o design. A [apresentação oficial dos personagens](https://ten-sura-t.bn-ent.net/character/) destaca as habilidades de Rimuru, o objetivo de coexistência e exemplos de nomeação e evolução.

| Pilar | Adaptação proposta |
| --- | --- |
| Predação | Obter essências, propriedades e formas de criaturas derrotadas. |
| Análise | Entender o que foi absorvido, revelar receitas e melhorar a automação. |
| Síntese | Combinar conhecimentos em habilidades e tecnologias. |
| Nomeação | Desenvolver moradores importantes e suas especializações. |
| Construção da nação | Converter descobertas em possibilidades permanentes. |

As receitas e regras abaixo são invenções de design, não descrições de habilidades canônicas. Há referências a conceitos de evolução do anime.

Para preservar o tema de coexistência, povos inteligentes não devem ser apenas alvos de farm: também oferecem missões, alianças, treinamento e desafios consensuais. Criaturas selvagens sustentam a caça repetível.

## 4. Ciclo principal

Escolher objetivo → preparar build e caça → lutar automaticamente → absorver e analisar → descobrir combinações → melhorar vila → enfrentar nova região.

Exemplos de objetivos:

- Obter uma habilidade de movimento.
- Coletar carapaças para construir uma oficina.
- Testar veneno contra um chefe.
- Recrutar um artesão para liberar armaduras.
- Conseguir a essência restante de uma fusão.

| Atividade | Funcionamento |
| --- | --- |
| Caça | Repetição automática de regiões conhecidas para obter recursos e absorções. |
| Exploração | Descoberta de caminhos, eventos e habitantes, com escolhas ocasionais. |
| Desafio | Chefes e encontros que testam a preparação da build. |

## 5. Combate e automação

Proposta: visão superior em mapas compactos, com clareiras, cavernas e corredores. O slime se move, encontra inimigos, usa habilidades e recolhe recompensas automaticamente.

Configuração inicial:

- Região e criatura prioritária.
- Postura agressiva, equilibrada ou cautelosa.
- Habilidades equipadas.
- Condição de retirada.

O Grande Sábio pode desbloquear regras mais específicas ao longo da progressão:

- Curar abaixo de um limite de vida.
- Priorizar inimigos à distância.
- Guardar ataques em área para grupos.
- Evitar elites durante coleta.
- Recuar quando acabar a recuperação disponível.

A automação é uma recompensa: o slime começa lutando por instinto e evolui para executar estratégias. Não criar um editor complexo de comportamento no primeiro protótipo.

## 6. Absorção

Combinar surpresa com progresso garantido, evitando depender exclusivamente de chances muito baixas.

| Recompensa | Frequência proposta | Uso |
| --- | --- | --- |
| Biomassa | Comum | Evolução corporal e melhorias básicas. |
| Fragmentos de essência | Frequentes | Pesquisa direcionada de uma criatura. |
| Núcleo de habilidade | Raro | Antecipar o desbloqueio de uma habilidade daquela criatura. |

Exemplo de balanceamento para testar: cada serpente fornece um fragmento; 40 fragmentos permitem pesquisar Presa Venenosa. Uma pequena chance de núcleo antecipa a descoberta. Estes números não estão fechados.

Regras propostas:

- A primeira habilidade aprendida fica permanentemente registrada.
- Duplicatas servem como material de domínio ou pesquisa.
- Mostrar habilidades disponíveis por criatura, chances e progresso garantido.
- Permitir marcar uma habilidade como objetivo.
- Resumir absorções offline sem gerar centenas de notificações.
- Criar escolha entre aperfeiçoar algo conhecido e investir em descobertas.

## 7. Domínio, evolução e fusão

- Domínio: melhora uma habilidade pelo uso.
- Evolução: transforma a habilidade após condições específicas.
- Fusão: combina conhecimentos para criar uma habilidade diferente.

| Conhecimentos | Resultado inventado | Efeito |
| --- | --- | --- |
| Jato de Água + Pressão | Lâmina Hidráulica | Atravessa inimigos alinhados. |
| Veneno + Névoa | Miasma | Cria uma área persistente de dano. |
| Fio + Carapaça | Casulo Defensivo | Absorve dano, com redução de mobilidade. |
| Movimento Sombrio + Mordida | Emboscada | Salta para um alvo prioritário. |
| Regeneração + Carapaça | Corpo Adaptativo | Fortalece a recuperação ao receber golpes. |
| Eletricidade + Água | Descarga Condutora | Espalha choque entre alvos molhados. |
| Predação + Análise avançada | Digestão Seletiva | Favorece uma pesquisa escolhida durante a caça. |

Aprender uma fusão não apaga as habilidades originais. O custo é essência e pesquisa, preservando a liberdade para experimentar.

Usar receitas específicas e famílias de propriedades, como água, veneno, corpo, percepção e sombra. Não permitir automaticamente todas as combinações possíveis: isso dificulta produção e compreensão.

Algumas receitas aparecem inicialmente como hipóteses: “Uma substância tóxica capaz de permanecer suspensa pode produzir um novo efeito.” Após descobrir, registrar a receita de forma clara.

## 8. Builds e limites

Absorver muitas habilidades é a fantasia; selecionar quais usar é a decisão estratégica.

Configuração inicial proposta:

- Três espaços de habilidades automáticas.
- Dois espaços de passivas.
- Uma especialização corporal.
- Mana e recuperação como limites de sustentação.
- Um quarto espaço automático como desbloqueio posterior importante.

| Build | Funcionamento | Limitação |
| --- | --- | --- |
| Predador resistente | Regeneração, defesa e sustentação por abates. | Lento contra chefes resistentes. |
| Slime tóxico | Veneno, névoa e controle de grupos. | Resistência a veneno reduz a eficiência. |
| Caçador sombrio | Mobilidade, crítico e execução. | Vulnerável quando cercado. |
| Condutor | Combinação de água e eletricidade. | Depende de mana e preparação. |
| Especialista em pesquisa | Segurança e eficiência de absorção. | Menor velocidade em desafios. |

Habilidades antigas devem continuar úteis por custo baixo, aplicação de estados ou sinergias.

## 9. Vila

A vila muda visualmente e libera ações: pesquisar, nomear, fabricar, negociar e enviar expedições.

| Construção | Benefício inicial | Expansão posterior |
| --- | --- | --- |
| Núcleo da vila | Objetivos e capacidade de expansão. | Distritos e projetos coletivos. |
| Laboratório de análise | Pesquisa de essências. | Fusões, pistas e análise de chefes. |
| Forja | Fabricação de armas. | Especializações e propriedades especiais. |
| Oficina de armaduras | Equipamentos defensivos. | Conjuntos que alteram builds. |
| Alquimia | Poções e antídotos. | Preparação para regiões perigosas. |
| Cozinha | Comida para expedições. | Refeições para estilos de caça. |
| Habitações | Receber moradores. | Especialistas e capacidade produtiva. |
| Posto de exploração | Revelar recursos e encontros. | Expedições secundárias. |
| Salão de nomeação | Desenvolver moradores importantes. | Evoluções e novas funções. |

Melhorias devem entregar mudanças observáveis, como liberar combinações de efeitos corporais, em vez de oferecer apenas pequenos bônus percentuais.

Começar com espaços definidos de construção. Posicionamento livre e decoração ficam para depois da validação do núcleo.

## 10. Moradores e nomeação

Fluxo proposto:

1. Conhecer ou acolher um morador.
2. Receber sua ajuda em uma atividade básica.
3. Completar uma missão que revela sua vocação.
4. Nomear e escolher uma especialização.
5. Desbloquear uma mudança em um sistema da vila.

Exemplos: goblin explorador ou capitão da guarda; artesão de armas ou armaduras; estudioso de criaturas ou equipamentos.

Nomeação pode usar reserva recuperável de magia e um marco narrativo. Não retirar permanentemente poder de combate do jogador.

Administrar moradores comuns em grupos; reservar decisões individuais para especialistas.

## 11. Armas, armaduras e buffs

Proposta de formas:

- Slime: equipamento assimilado com pequenas mudanças visuais.
- Humanoide, posteriormente: armas e armaduras visíveis.

A mudança de forma preserva os investimentos, evitando exigir dois conjuntos completos no início.

Equipamentos devem afetar decisões:

- Cajado que reduz custo de habilidades elementais.
- Espada que repete parte de um golpe após esquiva.
- Armadura que converte excesso de cura em escudo.
- Acessório de pesquisa que ocupa um espaço valioso para combate.

Começar com aprimoramento garantido e recuperação parcial de materiais ao desmontar. Evitar quebra por tentativa de melhoria, para incentivar experimentação.

Buffs de cozinha e alquimia podem servir a objetivos específicos: resistência ambiental, recuperação, sustentação de mana ou eficiência de coleta. Definir duração e consumo durante os testes para não exigir manutenção constante.

## 12. Regiões

Estrutura de design proposta, sem intenção de reproduzir exatamente o mapa do anime:

| Região | Aprendizado | Descobertas |
| --- | --- | --- |
| Caverna inicial | Absorver e equipar. | Percepção, veneno e defesa corporal. |
| Floresta | Selecionar alvos e lidar com grupos. | Fios, mobilidade e primeiros moradores. |
| Pântano | Preparar resistências. | Água, toxinas e alquimia. |
| Encosta mineral | Relacionar combate e produção. | Carapaças, minérios e forja avançada. |
| Ruínas | Ajustar prioridades e elementos. | Barreiras e pesquisas mágicas. |

Regiões antigas continuam relevantes por suas essências exclusivas. Melhorias de vila aumentam a eficiência de coleta para reduzir repetição.

Chefes abrem possibilidades, como uma pesquisa defensiva ou de barreira. Seus desafios devem exigir ajustes de build, não apenas mais dano.

## 13. Progresso offline

- Caçar regiões já comprovadas.
- Produzir materiais e avançar pesquisas.
- Conceder absorções pelas regras divulgadas.
- Não decidir alianças, fusões ou nomeações automaticamente.
- Não liberar regiões inéditas automaticamente.

Hipótese inicial: reserva de 12 horas, sujeita a testes.

No protótipo, calcular recompensas a partir de uma taxa estável de caça, considerando dano, vida, recuperação e encontros. Comparar resultados com a simulação ao vivo. Não tentar executar cada movimento do mapa durante todo o período offline.

Se a build falhar, retornar à vila e informar a causa, evitando mortes repetidas durante a ausência.

Exemplo de relatório: “Você derrotou 286 criaturas, concluiu a pesquisa de Carapaça e encontrou uma pista de fusão. A expedição terminou por falta de recuperação.”

## 14. Direção de arte

- Pixel art com visão superior.
- Tiles de 32 pixels como ponto de partida a validar.
- Silhuetas claras para personagem e inimigos.
- Slime expressivo por deformação, cor e pequenos detalhes.
- Animações legíveis de movimento, ataque e impacto.
- Absorção curta e satisfatória.
- Habilidades reconhecíveis por forma e cor.
- Vila evoluindo visualmente de acampamento para povoado.
- Moradores circulando e trabalhando.
- Controle de intensidade dos efeitos.
- Objetivo atual de pesquisa visível na interface.

Evitar perspectiva isométrica complexa e muitas variações de equipamentos no primeiro lançamento.

## 15. Alternativas e recomendações iniciais

| Decisão | Alternativas | Recomendação ainda não confirmada |
| --- | --- | --- |
| Protagonista | Rimuru ou slime próprio. | Slime próprio para trajetória e builds pessoais. |
| Mundo | Aberto contínuo ou regiões separadas. | Regiões compactas ligadas à vila. |
| Batalha | Automática ou intervenção manual frequente. | Automática com preparação estratégica. |
| Vila | Construção livre ou espaços definidos. | Espaços definidos inicialmente. |
| Multiplayer | MMO inicial ou experiência individual. | Individual primeiro. |
| Evolução | Reset de progresso ou expansão permanente. | Expansão permanente inicialmente. |

Plataforma e tecnologia já estão confirmadas: navegador com Phaser e TypeScript. Godot não faz parte do plano escolhido.

Antes de investir pesado em personagens e assets reconhecíveis para um produto comercial, definir a rota de identidade própria ou licenciamento de Slime.

## 16. Organização técnica — Phaser e TypeScript

Diretrizes propostas para a implementação futura:

- Phaser para cenas, renderização, animação, entrada e áudio.
- TypeScript para sistemas e definições de conteúdo.
- Separar regras de combate, progressão, absorção e economia da apresentação das cenas.
- Definir monstros, habilidades, receitas, equipamentos e prédios em dados.
- Compartilhar regras e parâmetros entre combate ao vivo e cálculo offline.
- Começar com save local versionado e possibilidade de exportar/importar o progresso.
- Validar suspensão e retomada da aba, recarregamento e concessão única das recompensas offline.
- Testar desempenho e legibilidade no navegador desde o protótipo.
- Backend, contas e sincronização ficam para uma decisão posterior; o protótipo individual não depende deles.

Essas diretrizes não significam que a implementação já foi iniciada.

## 17. Etapas de desenvolvimento

Estimativas para alguém experiente trabalhando em tempo integral, inicialmente com arte provisória. Arte original, aprendizado e multiplayer aumentam o trabalho. Validar cada entrega antes de expandir.

| Etapa | Entrega | Critério de avanço | Estimativa |
| --- | --- | --- | --- |
| Protótipo | Um mapa, três monstros, combate automático e absorção. | Dá vontade de perseguir a próxima habilidade. | 1–2 semanas |
| Núcleo de builds | Oito habilidades, três fusões e um chefe. | Duas combinações produzem estratégias diferentes. | 2–3 semanas |
| Vila integrada | Três construções e um especialista. | A caça melhora a vila e a vila altera a caça. | 2–3 semanas |
| Versão vertical | Tutorial, arte consistente, áudio, save e offline. | Uma sessão completa funciona sem explicação externa. | 3–5 semanas |
| Expansão | Mais regiões, receitas e moradores. | Jogadores entendem objetivos e experimentam builds. | Conforme testes |

### Escopo do primeiro produto jogável

- Um slime.
- Duas regiões pequenas.
- Seis criaturas comuns e dois chefes.
- Dez a doze habilidades.
- Quatro fusões.
- Quatro construções.
- Três especialistas.
- Progresso offline e save local.
- Aproximadamente uma hora de conteúdo inicial conectado.

Adiar PvP, mercado, guildas, temporadas, mundo compartilhado e centenas de receitas.

## 18. Primeiros 30 minutos

| Tempo | Experiência |
| --- | --- |
| 0–5 minutos | Derrotar uma criatura simples e aprender a primeira propriedade. |
| 5–10 minutos | Absorver uma segunda habilidade e perceber sua utilidade. |
| 10–15 minutos | Encontrar moradores e estabelecer o primeiro acampamento. |
| 15–20 minutos | Receber uma hipótese de fusão pelo laboratório. |
| 20–25 minutos | Buscar a essência restante e criar a primeira combinação. |
| 25–30 minutos | Vencer um chefe com a descoberta e melhorar visualmente a vila. |

## 19. Principal hipótese a validar

O jogador encontra uma habilidade, imagina uma combinação, muda sua caça para consegui-la e percebe uma diferença real ao voltar ao mapa.

Validar esse ciclo antes de produzir grande quantidade de conteúdo. O que o jogador encontra deve transformar tanto seu personagem quanto aquilo que a comunidade consegue construir.

## 20. Andamento

- Etapa 1 implementada: caça automática, absorção, progressão e interface de idle em toda a janela. Registro em [etapa-1.md](etapa-1.md).
- Etapa 2 implementada: oito habilidades básicas, builds de três espaços e seis pontos de capacidade, três fusões permanentes e primeiro chefe. Registro em [etapa-2.md](etapa-2.md).
- Etapa 3 implementada: vila integrada, três construções aprimoráveis, artesão goblin, materiais de caça, componentes assimilados e tônico. Registro em [etapa-3.md](etapa-3.md).
- As regras atuais de itens e síntese substituem as propostas iniciais: veja [habilidades-itens-e-caverna-v3.md](habilidades-itens-e-caverna-v3.md).
- Próxima entrega: versão vertical, com tutorial, áudio, exportação/importação de save e progresso offline. Demais decisões de conteúdo continuam propostas até implementação ou confirmação.
