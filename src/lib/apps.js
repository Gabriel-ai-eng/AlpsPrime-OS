// Catálogo central dos sub-apps do Alps OS. Compartilhado entre Categorias
// (grade/lista/cards) e Favoritos, para que os dois lugares mostrem sempre
// os mesmos dados (nome, arte, status) de cada app.
export const APPS = [
  { id: 'wonderbound', nome: 'Wonderbound', desc: 'Jogo de ação e sobrevivência.', cat: 'jogos', logo: '/apps/armor-logo.webp', logoQuadrado: '/apps/armor-logo-square.webp', status: 'live', url: '/jogo' },
  { id: 'fkw', nome: 'Free Kick World', desc: 'Jogo de futebol: mire e cobre a falta perfeita.', cat: 'jogos', logo: '/apps/fkw-logo.webp', logoQuadrado: '/apps/fkw-logo-square.webp', status: 'soon' },
  { id: 'sexta', nome: 'Sexta-feira', desc: 'Sua assistente de inteligência artificial.', cat: 'ia', logo: '/apps/sexta-logo.webp', logoQuadrado: '/apps/sexta-logo-square.webp', status: 'soon' },
];

// Apps indisponíveis: aparecem na lista, mas clicar neles NÃO faz nada.
export const BLOQUEADOS = new Set(['sexta', 'fkw']);
