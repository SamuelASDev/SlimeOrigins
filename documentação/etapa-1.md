# Etapa 1 — protótipo jogável

Implementada em 17/10/2026, com Phaser 3.90, TypeScript e Vite.

## Entregue

- Clareira em pixel art provisória desenhada por código.
- Slime que seleciona alvos, anda e ataca automaticamente.
- Besouro, serpente e lobo com vida, dano, experiência e reaparecimento.
- Níveis que aumentam ataque e vitalidade.
- Absorção com 15% de chance por abate e garantia no oitavo abate da espécie.
- Carapaça, Presa venenosa e Instinto caçador; um espaço de habilidade com troca livre.
- Priorização de espécie, pausa, diário e recuperação após derrota.
- Persistência local de progressão e habilidades.

## Validação executada

- `npm run build`: TypeScript e build de produção aprovados.
- `npm install`: auditoria sem vulnerabilidades no momento da instalação.
- Servidor local respondeu HTTP 200.
- Execução real no Edge: renderização do mapa, caça, abates, experiência e subida até o nível 3.
- Pausa e retomada verificadas pela interface.
- Priorização de serpentes produziu fragmentos da espécie e desbloqueou Presa venenosa.
- Equipamento de Presa venenosa confirmado na interface.
- Recarregamento preservou nível, experiência, abates, habilidade e equipamento.
- Nenhum erro de console capturado durante a verificação.
- Captura em [imagens/prototipo.png](imagens/prototipo.png).

## Limites e próximos passos

### Revisão da interface: idle clássico

A pedido do usuário, a interface passou a ocupar toda a janela com o cenário. Vida, experiência, atributos, alvo e controles são sobrepostos ao mapa. Habilidades, diário e opções abrem como janelas internas, uma por vez, sem interromper a caça. Há atalhos H/J/O, fechamento por Esc e opção de tela cheia do navegador. A câmera se adapta ao tamanho da janela e acompanha o slime.

Validação desta revisão: build aprovado; abertura e fechamento dos três menus e Esc verificados no Edge; entrada e saída de tela cheia verificadas; combate continuou com os painéis abertos; nenhum erro de console capturado. Imagem em [imagens/interface-idle.png](imagens/interface-idle.png).

Ainda não há vila, fusões, inventário de equipamentos, backend ou cálculo offline. O cenário é uma arena aberta; água rasa e pedras são elementos visuais sem colisão. A recuperação após derrota foi implementada, mas não exercitada na verificação manual. Não foi feita uma rodada completa de testes em dispositivos móveis.

O build informa um bundle acima de 500 kB por incluir o motor Phaser. É aceitável para esta etapa; otimização de carregamento fica para uma etapa posterior.

Próxima entrega sugerida: expandir o núcleo de builds com oito habilidades, três fusões e um chefe, após avaliar a sensação deste primeiro ciclo.
