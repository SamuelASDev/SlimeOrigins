# Slime · Origens

Protótipo individual de RPG idle para navegador, feito com Phaser 3, TypeScript e Vite. O slime usa a folha fornecida pelo usuário; os oito monstros e o guardião usam folhas geradas com imagegen seguindo essa referência. Não utiliza assets extraídos de Tibia.

## Executar

Requer Node.js compatível com Vite 8 (22.12+ ou 24+) e npm.

```powershell
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite, normalmente http://127.0.0.1:5173.

```powershell
npm run build
npm run preview
```

O build verificará os tipos e produzirá `dist/`, que pode ser servido por hospedagem estática. Não abra o HTML por `file://`.

## Jogar

- **V · Vila** visita um mapa seguro, sem monstros. Arraste com o mouse para explorar e clique nas construções para administrar. A caça fica suspensa durante a visita; **Voltar à caça** retorna à área anterior. Funde após dez abates, construa Oficina/Laboratório/Alquimia e acolha o artesão após vinte abates. Veja [documentação/etapa-3.md](documentação/etapa-3.md).

- O mapa ocupa toda a janela. Vida e experiência ficam no canto superior; os controles de caça ficam na barra inferior.
- Abra habilidades com **H**, fusões com **F**, chefe com **B**, diário com **J** e opções com **O**, ou pelos botões laterais. **Esc** fecha o painel. A caça continua ao fundo.
- Em **Opções**, use **Entrar em tela cheia** para ocultar também as barras do navegador.
- O slime procura inimigos, anda e ataca sozinho.
- Use o seletor para priorizar uma espécie e buscar sua habilidade.
- Cada abate oferece experiência, uma essência e 25% de chance de absorver um item de habilidade. A garantia de oito abates reinicia a cada absorção: cópias repetidas continuam caindo.
- No registro de absorções, clique em **Equipar**. Há três espaços e seis pontos de capacidade mágica. Cada habilidade ocupa um espaço; habilidades elementais custam dois pontos e fusões, três. Remova habilidades clicando na build ou no registro.
- As espécies têm tabelas de habilidades: a aranha fornece fio pegajoso/aço; morcegos, dreno/ultrassom; serpentes, veneno/calor. No primeiro setor, **Analisar nascente** fornece Lâmina de água e Regeneração, com recarga de 60 segundos.
- Em **Fusões**, escolha duas cópias. Uma síntese válida consome ambas e produz um item; tentativas incompatíveis não consomem nada. Duas iguais e do mesmo nível geram o nível seguinte. São nove níveis e três estágios: Inicial, Superior e Evoluída. Receitas não são antecipadas: a colinha provisória fica recolhida na própria janela.
- A build usa a melhor cópia da habilidade equipada. Consumir sua última cópia a remove da build. A síntese não cobra moeda e pode ser repetida para fabricar mais cópias do mesmo resultado.
- Em **Chefe**, desafie a Serpente Negra Anciã na caverna ou o Guardião na floresta após chegar ao nível 3 e absorver habilidades de três espécies. A build fica travada durante o combate. O chefe da caverna dá três cópias de habilidades garantidas por vitória. Veldora permanece amistoso.
- Cada vitória rende 10 essências, 100 EXP e um troféu. Sem perda de conhecimento ao falhar. O guardião acompanha o nível de entrada até o nível 8.
- Subir de nível melhora ataque e vida e recupera a vitalidade.
- Ao perder toda a vida, o slime se recupera por cinco segundos, sem perder progresso.
- **Pausar caça** interrompe a simulação. Em **Opções**, **Recomeçar aventura** apaga o progresso após confirmação.
- Nível, experiência, abates, fragmentos, essências, troféus, fusões e build ficam no armazenamento local do navegador. Saves v1 migram automaticamente e recebem essências pelos abates anteriores. Vida, monstros e caça recomeçam ao recarregar; um desafio em andamento não é salvo. Não há progresso offline nesta etapa.

## Escopo

Implementado: Caverna do Selo com sete setores conectados, salas amplas e pilares com colisão, aranhas, inventário de cópias, evolução em nove níveis/três estágios, onze combinações entre tipos, chefe da caverna, nascente renovável, encontro amistoso com Veldora e a clareira anterior. Vila e equipamentos pertencem às próximas etapas.

Em **Mapa**, escolha um setor para o slime caminhar até ele ou deixe a exploração automática avançar após seis abates. Desmarque essa opção para farmar no mesmo setor. O mapa tem 9.984 × 2.560 unidades; a câmera acompanha o personagem. O último setor alcançado é salvo. Veja [documentação/habilidades-itens-e-caverna-v3.md](documentação/habilidades-itens-e-caverna-v3.md) para regras, colinha completa, pesquisa do anime, arte, migração e limitações.

## Verificação

`npm test` executa os testes de progressão, migração, fusões, capacidade e regras de combate, com Node.js 22.18+ ou 24+. `npm run build` verifica os tipos e gera a versão de produção.

Os sprites ficam em `public/assets/sprites/`. Animações e carregamento estão em `src/sprite-art.ts`. Veja [documentação/sprites.md](documentação/sprites.md) para origem, prompts e atualização dos atlas.

A revisão anime usa as folhas `*-anime-v2.png`. Ataques agora têm preparação, execução, impacto e recuperação; veja [documentação/combate-visual.md](documentação/combate-visual.md).

Planejamento completo em [documentação/planejamento.md](documentação/planejamento.md).
