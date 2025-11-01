

export type Oferta = {
    id: string;
    title: string;
    type: 'Infoproduto' | 'Encapsulado' | 'SaaS';
    format: ('VSL' | 'Landing Page' | 'Quiz')[];
    ads: number;
    roas: number;
    ticket: number;
    status: 'escalando' | 'estável' | 'queda';
    imageUrl: string;
    imageHint: string;
    score: 'Alto' | 'Médio' | 'Baixo';
    porque?: string;
    vendasUrl?: string;
    checkoutUrl?: string;
};

export const formatOptions: { id: 'VSL' | 'Landing Page' | 'Quiz', label: string }[] = [
    { id: 'VSL', label: 'VSL' },
    { id: 'Landing Page', label: 'Landing Page' },
    { id: 'Quiz', label: 'Quiz' },
];

export const ofertas: Oferta[] = [
  {
    id: '1',
    title: 'Método de 7 Segundos',
    type: 'Infoproduto',
    format: ['VSL'],
    ads: 670,
    roas: 2,
    ticket: 297,
    status: 'escalando',
    imageUrl: '/Desparasitar.PNG',
    imageHint: 'health product',
    score: 'Alto',
    porque: 'Alto volume de novos criativos e expansão para outros mercados. O momento de testar é agora.',
    vendasUrl: 'https://pagina-vendas.com/metodo-7-segundos',
    checkoutUrl: 'https://checkout.com/metodo-7-segundos',
  },
  {
    id: '2',
    title: 'Bactéria Gordurosa',
    type: 'Encapsulado',
    format: ['Landing Page'],
    ads: 180,
    roas: 2,
    ticket: 467,
    status: 'escalando',
    imageUrl: 'https://picsum.photos/seed/oferta-2/600/400',
    imageHint: 'health science',
    score: 'Alto',
     porque: 'Sinais de saturação no público principal, mas com bom ROAS. Vale o teste em um novo ângulo.',
    vendasUrl: 'https://pagina-vendas.com/bacteria-gordurosa',
    checkoutUrl: 'https://checkout.com/bacteria-gordurosa',
  },
  {
    id: '3',
    title: '100 Receitas Ricas em Proteínas',
    type: 'Infoproduto',
    format: ['Quiz'],
    ads: 140,
    roas: 2,
    ticket: 30,
    status: 'queda',
    imageUrl: 'https://picsum.photos/seed/oferta-3/600/400',
    imageHint: 'healthy food',
    score: 'Baixo',
    porque: 'Apesar da queda, o ticket baixo pode ser uma barreira de entrada menor para novos públicos.',
    vendasUrl: 'https://pagina-vendas.com/100-receitas',
    checkoutUrl: 'https://checkout.com/100-receitas',
  },
   {
    id: '4',
    title: 'Automação para SaaS',
    type: 'SaaS',
    format: ['Landing Page'],
    ads: 320,
    roas: 3,
    ticket: 997,
    status: 'escalando',
    imageUrl: 'https://picsum.photos/seed/oferta-4/600/400',
    imageHint: 'software interface',
    score: 'Médio',
    porque: 'Solução B2B com ticket alto e demanda crescente. Pouca concorrência e alto potencial de escala no Brasil.',
    vendasUrl: 'https://pagina-vendas.com/automacao-saas',
    checkoutUrl: 'https://checkout.com/automacao-saas',
  },
  {
    id: '5',
    title: 'Kit de Beleza Natural',
    type: 'Encapsulado',
    format: ['VSL'],
    ads: 95,
    roas: 2.5,
    ticket: 197,
    status: 'estável',
    imageUrl: 'https://picsum.photos/seed/oferta-5/600/400',
    imageHint: 'cosmetics beauty',
    score: 'Médio',
    porque: 'Mercado em alta com público fiel e baixa concorrência em anúncios de vídeo.',
    vendasUrl: 'https://pagina-vendas.com/kit-beleza',
    checkoutUrl: 'https://checkout.com/kit-beleza',
  },
];
