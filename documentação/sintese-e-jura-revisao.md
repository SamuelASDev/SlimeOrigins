# Síntese por inventário e revisão dos sprites de Jura

## Ingredientes e combinações reais

O livro de receitas anterior listava todas as combinações do jogo, mesmo sem os ingredientes na mochila. Os seletores já partiam do inventário, mas essa lista geral fazia habilidades indisponíveis parecerem opções de síntese.

A seção **Combinações da sua mochila** substitui esse livro. Ela oferece somente pares concretos que podem ser usados agora: cópias existentes, distintas, livres de equipamento e sem proteção de favorito. Evoluções exigem duas cópias do mesmo nível, abaixo do limite. Cada opção identifica nome, nível e ID dos dois ingredientes; **Usar estas cópias** preenche os seletores. O resultado fica identificado como uma prévia e só vira um item depois da confirmação.

O registro de habilidades descobertas não fornece ingredientes. Depois de consumir ou vender uma cópia, seu ID deixa de ser uma opção válida. Seleções antigas são revalidadas ao abrir ou atualizar o menu. Favoritos e equipados continuam protegidos pelas regras de síntese e não entram nas sugestões.

A função de redesenho da síntese também deixou de ser sobrescrita ao abrir Habilidades. **Atualizar mochila** inclui os novos drops sob demanda, com aviso de cópias recebidas. Abates não remontam o menu nem mudam sua rolagem durante o combate.

## Sprites e composição de Jura

Alguns elementos da folha anterior tocavam as bordas de suas células, cortando partes e trazendo recortes inconsistentes. A mesma dimensão lógica era compartilhada entre props diferentes, embora não fossem poses de uma animação. Isso deslocava as bases ao dimensionar árvores, pedras e plantas.

A ferramenta integrada ImageGen gerou uma nova folha em `public/assets/sprites/forest-decor-anime-v3.png`, preservando a anterior. Os seis props têm margem transparente entre células. [Prompt completo](prompt-jura-recortes-v3.json). O script `scripts/build-forest-atlas.py` apenas mede a imagem e grava os metadados; cada prop tem tamanho e origem independentes, sem alterar o PNG.

O chão é desenhado também sob os obstáculos, separadamente da área caminhável. Assim, as raízes e rochas continuam bloqueando o caminho sem produzir quadrados escuros no terreno. Árvores de borda têm espaçamento mínimo, e plantas, troncos e afloramentos usam posições separadas das bases dos obstáculos. A profundidade acompanha a base de cada prop, na mesma ordenação dos personagens. As teias da floresta deixaram de esticar um recorte da caverna e passaram a usar linhas entre as árvores.

## Validação

71 testes passaram, incluindo inventário vazio com todas as descobertas, ingredientes consumidos, proteção de favoritos/equipados, pares de evolução, normalização de seleções, margens do atlas, âncoras independentes e espaçamento da decoração. Build de produção aprovado; permanece o aviso conhecido sobre tamanho do bundle Phaser.

No Edge, em `localhost` separado do save em `127.0.0.1`, foi carregado um cenário com todas as habilidades marcadas como descobertas, mas somente Carapaça #1 e Regeneração #2 na mochila. O menu apresentou uma combinação. Após confirmar, restou Corpo adaptativo #3 como única opção de ingrediente e nenhuma combinação disponível. Os ingredientes consumidos não reapareceram a partir do registro de descobertas. A captura também mostra a floresta com as árvores revisadas.

![Síntese limitada às cópias reais e floresta revisada](imagens/sintese-inventario-real.jpg)
