# Integração do Pixel

## Barras do topo e carregamento
- [x] Restaurar a faixa rolante do topo preservando a Black Friday e o cabeçalho.
- [x] Otimizar a prioridade e o tamanho das imagens sem alterar catálogo ou design; fotos alternativas carregam na interação.
- [x] Verificar a página e navegação em telas grandes e pequenas; 17 testes passaram, sem erros de execução, fluxo produto → carrinho → checkout confirmado.

## Apresentação da loja e checkout
- [x] Reduzir excessos antes das árvores e melhorar os botões mantendo a identidade da loja.
- [x] Melhorar a apresentação do checkout com CTA COMPRAR AGORA, sem alterar pagamentos, preços ou consentimento.
- [x] Verificar navegação, carrinho e checkout em telas grandes e pequenas, com CEP real e sem gerar cobrança; 16 testes passaram.

## Medição existente

- [x] Registrar PageView, ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo e Purchase nas ações correspondentes.
- [x] Atualizar o aviso e preservar o histórico das escolhas de privacidade, sem banner.
- [x] Ocultar a marca d’água Lovable.
- [x] Testar consentimento, valores, deduplicação e navegação no site.
- [ ] Verificar transmissão e recebimento na Meta em site publicado (depende de publicação e acesso ao Gerenciador de Eventos; localhost carregou o Pixel mas não transmitiu eventos).