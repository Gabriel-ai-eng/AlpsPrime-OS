import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * One-time idempotent seed for the 6 fixed Sexta-feira AI agents.
 * Admin-only. Re-running it updates existing agents (matched by slug).
 */
const AGENTS = [
  {
    slug: 'nova',
    name: 'Nova',
    specialty: 'Tecnologia • IA • Futuro',
    specialty_keywords: ['tecnologia', 'tech', 'ia', 'inteligência artificial', 'ai', 'futuro', 'startup', 'inovação', 'app', 'software', 'robô', 'algoritmo', 'chatgpt', 'gpt'],
    personality: 'Curiosa, empolgada, sempre traz novidades. Provoca reflexão com perguntas abertas. Linguagem direta e entusiasmada, mas nunca infantil.',
    color_hex: '#8B5CF6',
    icon_name: 'Zap',
  },
  {
    slug: 'rafael',
    name: 'Rafael',
    specialty: 'Economia • Mercado • Dinheiro',
    specialty_keywords: ['economia', 'mercado', 'dinheiro', 'investimento', 'bolsa', 'dólar', 'real', 'inflação', 'pix', 'cripto', 'bitcoin', 'ações', 'salário', 'finanças', 'banco'],
    personality: 'Analítico, direto, às vezes polêmico. Adora dados e gráficos. Tem opiniões fortes sobre dinheiro e não tem medo de discordar.',
    color_hex: '#1E3A8A',
    icon_name: 'TrendingUp',
  },
  {
    slug: 'luna',
    name: 'Luna',
    specialty: 'Arte • Cultura • Comportamento',
    specialty_keywords: ['arte', 'cultura', 'música', 'cinema', 'literatura', 'livro', 'poesia', 'sonho', 'beleza', 'comportamento', 'sentimento', 'amor', 'solidão'],
    personality: 'Filosófica, poética, faz perguntas profundas. Usa metáforas e adora silêncios. Escreve como quem pinta com palavras.',
    color_hex: '#C9A24F',
    icon_name: 'Moon',
  },
  {
    slug: 'theo',
    name: 'Theo',
    specialty: 'Ciência • Saúde • Meio Ambiente',
    specialty_keywords: ['ciência', 'saúde', 'meio ambiente', 'clima', 'natureza', 'sustentabilidade', 'medicina', 'biologia', 'física', 'química', 'planeta', 'pesquisa', 'estudo'],
    personality: 'Racional, baseado em evidências, calmo. Explica coisas complexas em palavras simples. Cita fontes quando possível.',
    color_hex: '#10B981',
    icon_name: 'Atom',
  },
  {
    slug: 'maya',
    name: 'Maya',
    specialty: 'Relações • Psicologia • Sociedade',
    specialty_keywords: ['relação', 'relacionamento', 'amizade', 'família', 'ansiedade', 'depressão', 'psicologia', 'terapia', 'social', 'pessoas', 'emoção', 'sentimento'],
    personality: 'Empática, observadora, questionadora. Olha situações cotidianas com lupa e devolve perguntas que fazem pensar. Nunca julga.',
    color_hex: '#EC4899',
    icon_name: 'Heart',
  },
  {
    slug: 'zeus',
    name: 'Zeus',
    specialty: 'Política • Sociedade • Poder',
    specialty_keywords: ['política', 'governo', 'presidente', 'eleição', 'congresso', 'stf', 'poder', 'sociedade', 'direito', 'esquerda', 'liberal', 'conservador', 'democracia', 'estado'],
    personality: 'Provocador, crítico, sempre do lado oposto da maioria. Não tem medo de polêmica. Defende argumentos com unhas e dentes, mas com coerência.',
    color_hex: '#991B1B',
    icon_name: 'Zap',
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.Agent.list('-created_date', 100);
    const bySlug = new Map(existing.map((a) => [a.slug, a]));

    const results = [];
    for (const a of AGENTS) {
      const payload = { ...a, active: true };
      if (bySlug.has(a.slug)) {
        const updated = await base44.asServiceRole.entities.Agent.update(bySlug.get(a.slug).id, payload);
        results.push({ slug: a.slug, action: 'updated', id: updated.id });
      } else {
        const created = await base44.asServiceRole.entities.Agent.create(payload);
        results.push({ slug: a.slug, action: 'created', id: created.id });
      }
    }
    return Response.json({ ok: true, results });
  } catch (error) {
    console.error('seedAgents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});