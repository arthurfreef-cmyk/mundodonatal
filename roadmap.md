# Integração do Pixel

## Troca do provedor Pix
- [x] Remover o provedor anterior; usar somente a Fruitfy.
- [x] Salvar token, loja e ID de produto Fruitfy como segredos.
- [x] Gerar Pix Fruitfy no servidor (valor em centavos recalculado, origem da campanha enviada) e mostrar QR/copia e cola; testado com 2 produtos (R$ 47,46).
- [x] Confirmar pagamento consultando o pedido na Fruitfy a cada 5 s; Purchase só após confirmação, com o valor pago.
- [x] Lembrar nome, e-mail e celular do comprador no aparelho para a próxima compra.
- [ ] Webhooks Fruitfy com processamento único: depende de guardar pedidos (Lovable Cloud) e do formato oficial de autenticação dos avisos; aguardando decisão do usuário.

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