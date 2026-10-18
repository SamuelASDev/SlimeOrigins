# Etapa 2 — builds, fusões e primeiro chefe

Implementação: 17/10/2026. Tecnologia mantida: Phaser 3, TypeScript e navegador. Interface com mapa em toda a janela e menus internos.

## Entregue

- Oito espécies na clareira, com sprites provisórios próprios e duas criaturas de cada espécie por população inicial.
- Oito habilidades absorvíveis: Carapaça, Presa venenosa, Instinto caçador, Regeneração, Véu de névoa, Jato de água, Centelha e Dreno vital.
- Três espaços de habilidade e capacidade de seis pontos de magia. Habilidades básicas custam um; Água e Centelha, dois; fusões, três.
- Efeitos diferentes: mitigação, veneno periódico, recuperação, roubo de vida, mobilidade, água, eletricidade em múltiplos alvos e sinergia contra inimigos molhados.
- Uma essência por abate para gastar em sínteses; fragmentos por espécie continuam servindo à descoberta garantida no oitavo abate.

## Receitas

| Conhecimentos exigidos | Resultado | Custo | Uso |
| --- | --- | --- | --- |
| Carapaça + Regeneração | Corpo adaptativo | 12 essências | 45% de mitigação e 5 de recuperação/s. Não acumula com os pais. |
| Presa venenosa + Véu de névoa | Miasma | 12 essências | Veneno em área, uma vez por segundo, ignorando armadura. |
| Jato de água + Centelha | Tempestade condutora | 12 essências | Molha e eletrifica até três alvos; a água amplia o dano elétrico. |

As fusões são permanentes, cobradas uma vez e não consomem os conhecimentos originais. Após sintetizar, equipar em Habilidades. A capacidade é um limite de build, não uma barra consumível de mana.

## Guardião da carapaça

- Acessível pelo menu Chefe (B), após nível 3 e três habilidades absorvidas. Nível 4 recomendado.
- Arena individual: a população comum e seus respawns pendentes não invadem o desafio.
- Vida cheia ao iniciar; build travada durante a luta. Pausar e recuar continuam disponíveis.
- Carapaça recebe 60% menos dano físico. Veneno ignora a carapaça e água causa 25% a mais de dano.
- Impacto sísmico avisa sua área com antecedência. Instinto caçador aciona recuo automático; Véu de névoa reduz dano de área.
- Vida e dano acompanham o nível de entrada até nível 8, permitindo superar o chefe por progressão posterior.
- Vitória: 10 essências, 100 EXP e um troféu. Derrota ou retirada não removem progresso.
- Ao terminar, a caça comum retorna e o painel mostra o resultado.

## Progresso e estrutura

- Save v2 preserva nível, experiência, abates, fragmentos, descobertas, essências, fusões, build e vitórias do chefe.
- Migração automática do save v1, incluindo a habilidade equipada. Abates antigos viram essências; novas habilidades precisam ser descobertas.
- Vida, temporizadores e desafios em andamento não são persistidos. Sem cálculo offline nesta etapa.
- Regras e conteúdo em `src/model.ts`; cenário em `src/world.ts`; apresentação e combate em `src/app.ts`; interface em `src/game.css`.
- Nenhum asset foi extraído de Tibia ou do anime. Receitas e regras são adaptações originais para este protótipo.

## Validação

- Sete testes automatizados de migração, garantia de absorção, custos e pré-requisitos de síntese, preservação dos pais, espaços/capacidade, não duplicação de efeitos, fraquezas elementais e saneamento de saves.
- Build de produção e verificação TypeScript aprovados.
- No Edge: migração do save existente, pesquisa de habilidades, síntese das três receitas e equipamento das fusões verificados pela interface.
- Vitória contra o guardião com Presa venenosa + Instinto caçador + Corpo adaptativo.
- Segunda vitória com Instinto caçador + Carapaça + Tempestade condutora, demonstrando outra estratégia de dano.
- Trava de equipamento durante o desafio e concessão de recompensa verificadas.
- Derrota com build vazia e retirada manual verificadas: sem perda das essências, troféus e descobertas anteriores, com retorno da população comum.
- Registro visual em [imagens/etapa-2-combate.png](imagens/etapa-2-combate.png).

## Próxima etapa

Integrar a vila ao ciclo de caça: três construções iniciais e um especialista, com melhorias que alterem o combate e a pesquisa. Esta etapa ainda não implementa vila, armas, armaduras ou novas regiões. O balanceamento atual é provisório e precisa de partidas começando do zero e testes com jogadores.
