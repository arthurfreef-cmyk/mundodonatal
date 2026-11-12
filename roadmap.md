# Integração do Pixel

## Troca do provedor Pix
- [x] Remover o provedor anterior e suas chamadas, preservando o visual; Pix indisponível até completar a Fruitfy, conforme solicitado.
- [ ] Aplicar o exemplo recebido de cobrança com name/email/phone/cpf/items/utm; confirmar caminho de produção e resposta Pix, pois o exemplo usa localhost e não contém retorno.
- [ ] Ativar Fruitfy e verificar geração e consulta do Pix; credenciais salvas, mas depende da documentação completa de criação e consulta. Não utilizar outro provedor.
- [x] Salvar FRUITFY_API_TOKEN e FRUITFY_STORE_ID pelo formulário seguro, sem expor os valores.
- [x] Salvar FRUITFY_PRODUCT_ID em segredo para uso único em todos os produtos na integração Fruitfy; preservar os identificadores do catálogo da loja.
- [ ] Implementar pedidos persistentes, webhooks autenticados e processamento idempotente; exemplo order_paid recebido com webhook_id e order.id, mas faltam o método oficial de autenticação, criação e consulta do Pix e a unidade monetária documentada. Não tratar o exemplo como pagamento real.

## Revisão da loja
- [x] Remover a barra vermelha e manter somente a preta rolante, conforme o pedido mais recente; confirmado visualmente no celular.
- [x] Corrigir carrinho inválido/armazenamento bloqueado, menu acessível, endereço antigo ao mudar CEP, cópia Pix sem confirmação, avisos incorretos e overflow no rodapé, preservando preços e Pix.
- [x] Verificar produto → carrinho → checkout com CEP real, busca no celular e larguras de 320 a 1334 px; 20 testes passaram, sem gerar cobrança.
- [ ] Verificar o registro do endereço e o tratamento de status finais do Pix na Fruitfy; depende dos campos oficiais. Nenhuma cobrança real realizada nesta revisão.

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