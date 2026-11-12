# Integração do Pixel

## Troca do provedor Pix
- [ ] Substituir InvictusPay por Fruitfy, preservando preços, frete, checkout e confirmação de pagamento; aguardando documentação completa de criação e consulta do Pix (acesso público bloqueado).
- [ ] Configurar credenciais Fruitfy e verificar geração e consulta do Pix; depende da documentação, token e Store-Id da loja. Manter o provedor atual até a troca estar validada.
- [x] Salvar FRUITFY_API_TOKEN e FRUITFY_STORE_ID pelo formulário seguro, sem expor os valores.
- [ ] Implementar pedidos persistentes, webhooks autenticados e processamento idempotente; depende do contrato oficial de assinatura, eventos e consulta Fruitfy.

## Revisão da loja
- [x] Remover a barra vermelha e manter somente a preta rolante, conforme o pedido mais recente; confirmado visualmente no celular.
- [x] Corrigir carrinho inválido/armazenamento bloqueado, menu acessível, endereço antigo ao mudar CEP, cópia Pix sem confirmação, avisos incorretos e overflow no rodapé, preservando preços e Pix.
- [x] Verificar produto → carrinho → checkout com CEP real, busca no celular e larguras de 320 a 1334 px; 20 testes passaram, sem gerar cobrança.
- [ ] Verificar o registro do endereço na integração de pedidos e o tratamento de status finais do Pix (depende de confirmar os campos e status aceitos pela InvictusPay; nenhuma cobrança real realizada nesta revisão).

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