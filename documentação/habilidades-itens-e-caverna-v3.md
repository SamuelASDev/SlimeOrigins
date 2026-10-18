# Caverna ampliada e habilidades como itens

Esta revisão substitui as regras de desbloqueio permanente e receitas anunciadas da versão anterior. O registro das descobertas continua existindo, mas é necessário possuir uma cópia para usar uma habilidade.

## Exploração e arte

O mapa passa de 4.096 × 1.280 para **9.984 × 2.560 unidades**: 4,875 vezes a área total anterior. São sete setores: despertar, lago, magiminério, ninho das tecelãs, abismo da serpente, passagem das carapaças e câmara do selo. Cada sala ocupa aproximadamente 37 × 29 células de 32 unidades, contra 17 × 13 anteriormente; a superfície transitável é irregular, e não um retângulo completamente aberto.

Salas têm ombros e alcovas, corredores mais largos, pilares com colisão, paredes facetadas, poças, cristais de magiminério, ervas hipokute, musgo, raízes, cascalho, teias e casulos. O novo atlas de enfeites e os sprites da aranha e do chefe foram gerados com a ferramenta integrada `image_gen.imagegen`. Os PNGs estão em `public/assets/sprites/cave-decor-v2.png`, `cave-spider-v2.png` e `cave-serpent-boss.png`. Prompts completos em [prompts-caverna-v3.json](prompts-caverna-v3.json). Nenhum pixel foi alterado pelo gerador de atlas.

O slime caminha até o setor escolhido; o mapa não teletransporta entre setores. O desafio do chefe tem uma entrada própria de arena. O último setor alcançado e os setores visitados ficam no save. Vida, posição exata e inimigos são recriados ao carregar. A exploração automática continua opcional, avançando após seis abates. Há dez inimigos por setor, com respawn.

## Revisão da composição do cenário

A distribuição aleatória de enfeites foi substituída por formações planejadas. Plantas acompanham as margens dos dois lagos; cristais se concentram em afloramentos junto aos pilares e nichos; teias ocupam cantos do ninho. Cada formação compartilha uma base de chão e usa uma peça principal com detalhes menores. O centro das salas e os corredores ficam livres de enfeites altos. Há menos tipos misturados em cada setor e menos elementos isolados, preservando áreas de descanso visual.

## Inventário e evolução

Cada absorção gera um item com identificador próprio, habilidade e nível. Há 25% de chance por abate e uma garantia após oito abates sem absorver daquela espécie. A garantia reinicia depois de cada item; portanto, continua funcionando para duplicatas. Quando a espécie tem duas habilidades, a escolha é equiprovável. O contador de fragmentos antigo passa a ser um registro de abates, separado da garantia.

O inventário agrupa cópias da mesma habilidade e nível. A síntese seleciona duas cópias individuais. A build continua limitada a três habilidades e seis pontos de magia, usando automaticamente a cópia de maior nível daquela habilidade. Usar a última cópia de uma habilidade equipada em outra receita a remove da build; o registro de descoberta permanece.

- Mesma habilidade e mesmo nível: consome duas cópias e produz uma no nível seguinte.
- Níveis 1–3: estágio Inicial; 4–6: Superior; 7–9: Evoluída.
- Cada nível aumenta em 18% o fator do efeito. Defesas e dreno têm limites para evitar invulnerabilidade.
- No nível 9, não há aprimoramento adicional. São necessárias 256 cópias de nível 1 para uma habilidade de nível 9 pela rota de duplicatas.
- Habilidades diferentes: uma combinação cadastrada produz um novo tipo. Seu nível é o menor dos dois ingredientes, evitando usar uma cópia fraca para multiplicar uma evolução avançada.
- Combinação desconhecida/incompatível, nível diferente da mesma habilidade, mesmo item nos dois espaços ou nível máximo: nenhuma cópia é consumida.
- Não há cobrança de essências em moeda para sintetizar. O custo são as próprias habilidades.

A tela mostra dois espaços e um resultado desconhecido. A colinha fica fechada em uma seção provisória, separada da operação de síntese. Descobertas anteriores migram para uma cópia de cada habilidade conhecida; níveis, moeda, troféus e build são preservados. O formato agora é v3, usando a mesma chave local para migrar o save anterior.

## Espécies e habilidades

| Fonte | Itens absorvíveis |
| --- | --- |
| Aranha negra | Fio pegajoso; Fio de aço |
| Morcego gigante | Dreno vital; Ondas ultrassônicas |
| Serpente negra | Hálito venenoso; Detecção de calor |
| Centopeia maligna | Hálito paralisante |
| Armorsaurus | Armadura corporal; Fortalecimento corporal |
| Análise da nascente | Lâmina de água; Regeneração |

O fio pegajoso imobiliza; o fio de aço corta ignorando carapaças; ultrassom causa dano e atrasa ataques; detecção de calor aumenta ataque; paralisia atrasa ataques; armadura reduz dano. As novas sínteses acrescentam interrupção de preparações, cortes de água em área e combinações de ataque e defesa. Controle tem duração reduzida contra chefes.

A nascente do primeiro setor renova em 60 segundos reais, com recarga persistida para evitar obter cópias ilimitadas recarregando a página. Sua análise fornece uma Lâmina de água e uma Regeneração. Esta é uma adaptação para permitir experimentar o sistema sem depender apenas do drop dos monstros; não afirma que no anime ervas concedem cópias literais de habilidades. O fortalecimento do Armorsaurus e as receitas de fusão também são adaptações.

## Colinha provisória

| Ingrediente A | Ingrediente B | Resultado |
| --- | --- | --- |
| Qualquer habilidade | Cópia igual e de mesmo nível | Próximo nível/estágio |
| Carapaça | Regeneração | Corpo adaptativo |
| Presa venenosa | Véu de névoa | Miasma |
| Jato de água | Centelha | Tempestade condutora |
| Fio pegajoso | Hálito paralisante | Prisão de seda |
| Fio de aço | Lâmina de água | Fio cortante aquático |
| Detecção de calor | Ondas ultrassônicas | Percepção mágica |
| Armadura corporal | Fortalecimento corporal | Bastião vivo |
| Hálito venenoso | Hálito paralisante | Miasma |
| Armadura corporal | Regeneração | Corpo adaptativo |
| Lâmina de água | Centelha | Tempestade condutora |
| Fio pegajoso | Fio de aço | Prisão de seda |

## Chefe da caverna

**Serpente Negra Anciã**, variante original do jogo baseada na espécie da caverna. Veldora continua sendo um encontro amistoso. O chefe fica no abismo, usa projéteis de veneno e um ataque de área com preparação anunciada. Instinto caçador ou Percepção mágica permitem recuar automaticamente. Água e veneno ajudam contra as escamas. Requer nível 3 e três habilidades de espécies descobertas, como o desafio anterior. A entrada restaura a vida e trava a build; derrota e retirada não removem itens.

Vitória concede três itens garantidos (Hálito venenoso, Detecção de calor e Hálito paralisante), dez essências, cem EXP e um troféu. A caverna também tem contador próprio de vitórias. O desafio do guardião da floresta continua disponível quando aquela área está selecionada.

## Fontes e limites da adaptação

- [Página oficial do episódio 1](https://www.ten-sura.com/anime/tensura/story/no1): despertar, ervas, minério e amizade com Veldora.
- [Resumo da caverna e espécies, fonte secundária em japonês](https://www.shurigekijou.com/tensura-sealed-cave/): aranha com fio pegajoso/aço, serpente com calor/veneno, centopeia com paralisia, morcego com dreno/ultrassom e Armorsaurus com armadura.
- [Giant bat — enciclopédia da comunidade](https://tensura.fandom.com/wiki/Giant_bat): habilidades do morcego e sua aparição no episódio 2.

Nomes, origens e atmosfera orientam o projeto; geografia, ciclos de respawn, probabilidades, estágios, combinações, efeitos numéricos e a variante chefe são regras deste jogo. Evitou-se usar como cânone as wikis de mods de Minecraft ou textos de fanfiction encontrados na pesquisa.

## Validação e próximos ajustes

Os 19 testes passam e o build de produção foi gerado. Cobrem todos os trajetos entre setores, paredes e limites, drops repetidos, reinício da garantia, tabelas de espécies, consumo exato de duas cópias, simetria das receitas, tentativas inválidas, limite de evolução, preservação de sobras, retirada da build e migração completa de save. Verificação manual no navegador cobre síntese, aprimoramento pela interface e vitórias contra o novo chefe. A geometria estática foi rasterizada em blocos de até 1.024 unidades no próprio Phaser, evitando reenviar os comandos de desenho de toda a caverna em cada quadro.

Próximos candidatos: favoritar cópias para protegê-las da síntese; filtros por estágio/origem; histórico pessoal de resultados descobertos; extração de materiais físicos para a vila; expedições com objetivos por espécie; aparência alternativa da habilidade ao mudar de estágio. Não há fusão em lote, progresso offline ou economia de equipamentos nesta entrega.
