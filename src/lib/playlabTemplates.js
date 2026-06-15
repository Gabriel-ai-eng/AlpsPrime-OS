/**
 * Pre-built world templates for PlayLab.
 * Each template is a small tilemap (cols x rows) where:
 *   0 = empty (walkable)
 *   1 = solid wall / floor (collides)
 *   2 = decorative object (interactable when player is adjacent)
 *
 * Each template also defines a palette so the canvas renderer can theme it.
 */

export const TEMPLATES = {
  bedroom: {
    name: 'Quarto',
    description: 'Um quarto aconchegante com cama, geladeira e computador.',
    palette: { bg: '#1a1530', wall: '#3a2a55', floor: '#5a4480', accent: '#c9a24f' },
    cover: '🛏️',
    objects: [
      { type: 'fridge', label: 'Geladeira', x: 2, y: 6 },
      { type: 'computer', label: 'Computador', x: 12, y: 6 },
      { type: 'bed', label: 'Cama', x: 7, y: 6 },
      { type: 'tv', label: 'TV', x: 17, y: 6 },
    ],
  },
  street: {
    name: 'Rua',
    description: 'Uma rua urbana com fachadas coloridas e portais.',
    palette: { bg: '#2a3a5a', wall: '#4a5a7a', floor: '#6a7a9a', accent: '#e8c77a' },
    cover: '🏙️',
    objects: [
      { type: 'mailbox', label: 'Caixa de correio', x: 4, y: 6 },
      { type: 'portal', label: 'Portal', x: 16, y: 6 },
      { type: 'bench', label: 'Banco', x: 9, y: 6 },
    ],
  },
  forest: {
    name: 'Floresta',
    description: 'Uma floresta mística cheia de árvores e cogumelos.',
    palette: { bg: '#0f2515', wall: '#1f4528', floor: '#2f6035', accent: '#b8e986' },
    cover: '🌲',
    objects: [
      { type: 'tree', label: 'Árvore', x: 3, y: 6 },
      { type: 'mushroom', label: 'Cogumelo', x: 8, y: 6 },
      { type: 'tree', label: 'Árvore', x: 13, y: 6 },
      { type: 'portal', label: 'Portal', x: 17, y: 6 },
    ],
  },
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Uma cidade neon do futuro com hologramas.',
    palette: { bg: '#0a0a1f', wall: '#3a0a55', floor: '#1a1a3a', accent: '#ff2bd6' },
    cover: '🌃',
    objects: [
      { type: 'computer', label: 'Terminal', x: 3, y: 6 },
      { type: 'hologram', label: 'Holograma', x: 9, y: 6 },
      { type: 'portal', label: 'Portal', x: 16, y: 6 },
    ],
  },
};

/**
 * Build a tilemap grid for a given template. 20 cols x 10 rows.
 * Top half is air, bottom rows are floor. Walls on the sides.
 */
export function buildTilemap(templateKey) {
  const cols = 20;
  const rows = 10;
  const grid = [];
  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      if (y === rows - 1) row.push(1); // floor
      else if (x === 0 || x === cols - 1) row.push(1); // walls
      else row.push(0);
    }
    grid.push(row);
  }
  return { grid, cols, rows, tile: 32 };
}

export function getTemplate(key) {
  return TEMPLATES[key] || TEMPLATES.bedroom;
}