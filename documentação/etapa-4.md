# Etapa 4 — Vila de Tempest e versão vertical

## Vila

O cenário estático foi substituído por geometria pixel art em Phaser, numa grade de quatro pixels. Casas com telhados azuis, praça de pedra, fonte, rio, ponte, paliçada, mercado e jardim formam uma vila inspirada em Tempest. A arte é desenhada pelo código, sem downloads externos.

- **Kaijin**: oficina, recrutamento e componentes assimilados.
- **Benimaru**: laboratório e acesso à câmara de síntese.
- **Shuna**: alquimia e tônico de vitalidade.

Os moradores têm marcadores animados e áreas de interação explícitas. Arrastar move a câmera; um movimento acima de oito pixels cancela a conversa. A roda ajusta o zoom. Os botões inferiores também acessam cada serviço, e V retorna à caça. Os níveis de construção aparecem no mapa. As construções são representadas visualmente desde o começo; as instalações precisam ser liberadas com os recursos e marcos existentes.

## Próxima etapa implementada

- Orientação contextual de objetivos: absorver, equipar, fundar, construir, recrutar e desafiar o chefe. Clique no objetivo para abrir o sistema correspondente.
- Áudio sintetizado para menus e eventos importantes, desligado por padrão e configurável em Opções. Ainda não há trilha musical nem áudio ambiente.
- Exportação de save JSON e importação validada, com confirmação de substituição. Os saves antigos continuam usando a migração existente.
- Salvamento periódico a cada 15 segundos, além dos eventos de jogo.
- Expedição offline em rotas conhecidas: requer uma habilidade equipada, pelo menos 60 segundos e três abates observados na caçada ativa. Usa metade do ritmo observado e limita a recompensa a duas horas e 240 criaturas. Concede os mesmos recursos e sorteios de habilidades da caça, sem chefes, novas regiões, construções ou decisões automáticas.
- Durante a ausência da aba, a simulação de combate é suspensa. Ao voltar ou recarregar, o checkpoint é consumido e substituído; recarregar novamente não reaplica o mesmo período. Pausa, visita à vila, mudança de região e derrota reiniciam a amostra de caça. Uso simultâneo em várias abas não é suportado.

O offline é uma estimativa conservadora baseada no ritmo observado, não uma simulação de combate e sobrevivência. Sessões sem uma amostra válida não recebem recompensas.

## Verificação e limites

`npm test`: 28 testes aprovados, incluindo cinco novos testes sobre offline, saves e objetivos.
`npm run build`: TypeScript e build de produção aprovados. O Vite ainda avisa sobre o tamanho do pacote Phaser.

Não foi possível realizar QA visual ou testar cliques no navegador: a ferramenta de interface não encontrou nenhum navegador disponível. Conferir manualmente em `npm run dev`: abrir V, arrastar, ampliar, conversar com os três moradores, construir e recrutar; exportar/importar em Opções; ativar áudio; formar amostra de caça e retornar após um minuto de ausência.

Próximo trabalho: validar essa sessão completa no navegador, ajustar composição em telas pequenas e balancear o ritmo offline com sessões reais antes da expansão de regiões.
