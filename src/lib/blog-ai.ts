// ============================================================
// Drudi e Almeida — Gerador de Artigos com Gemini
// ============================================================

export interface GeneratedArticle {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  keywords: string;
  read_time: string;
  content: string; // HTML completo
  schema_faq: Array<{ q: string; a: string }>;
  related_topics: string[];
}

const CATEGORY_AUTHORS: Record<string, { author: string; crm: string; img: string }> = {
  'Catarata': {
    author: 'Dr. Fernando Macei Drudi',
    crm: 'CRM-SP 139.300',
    img: '/images/dr-fernando-800w.webp',
  },
  'Ceratocone': {
    author: 'Dra. Priscilla R. de Almeida',
    crm: 'CRM-SP 156.789',
    img: '/images/dra-priscilla-800w.webp',
  },
  'Glaucoma': {
    author: 'Dr. Fernando Macei Drudi',
    crm: 'CRM-SP 139.300',
    img: '/images/dr-fernando-800w.webp',
  },
  'Retina': {
    author: 'Dr. Fernando Macei Drudi',
    crm: 'CRM-SP 139.300',
    img: '/images/dr-fernando-800w.webp',
  },
  'Estrabismo': {
    author: 'Dra. Priscilla R. de Almeida',
    crm: 'CRM-SP 156.789',
    img: '/images/dra-priscilla-800w.webp',
  },
  'Saúde Ocular': {
    author: 'Dr. Fernando Macei Drudi',
    crm: 'CRM-SP 139.300',
    img: '/images/dr-fernando-800w.webp',
  },
};

export function getAuthorForCategory(category: string) {
  return CATEGORY_AUTHORS[category] ?? CATEGORY_AUTHORS['Saúde Ocular'];
}

// ─── Gerar artigo com Gemini ─────────────────────────────────────────────────
export async function generateArticleWithGemini(
  geminiApiKey: string,
  topic: string,
  category: string
): Promise<GeneratedArticle> {
  const prompt = `Você é um especialista em SEO e redator médico para a clínica oftalmológica Drudi e Almeida, localizada em São Paulo (unidades em Lapa, Santana, Tatuapé, São Miguel e Guarulhos).

Escreva um artigo completo e otimizado para SEO sobre o tema: "${topic}"
Categoria: ${category}

REQUISITOS DO ARTIGO:
1. Título principal (H1): deve conter a palavra-chave principal, ser atrativo e ter entre 50-60 caracteres
2. Meta title SEO: versão otimizada do título para Google (máx 60 caracteres)
3. Meta description: resumo atrativo para o Google (entre 150-160 caracteres), incluindo CTA
4. Excerpt: resumo do artigo para cards (2-3 frases, ~200 caracteres)
5. Keywords: 5-8 palavras-chave separadas por vírgula (foco em long-tail para São Paulo)
6. Conteúdo HTML: artigo completo com:
   - Introdução envolvente (2-3 parágrafos)
   - 4-6 seções com H2 e subseções com H3 quando necessário
   - Listas <ul>/<ol> para facilitar leitura
   - Tabelas <table> quando comparar opções
   - Parágrafos <p> bem desenvolvidos
   - Menção natural à Drudi e Almeida em 2-3 pontos
   - CTA ao final: "Agende sua consulta na Drudi e Almeida"
   - Mínimo de 1500 palavras
7. FAQ Schema: 5-7 perguntas e respostas frequentes sobre o tema
8. Slug: URL amigável em português (ex: cirurgia-catarata-sao-paulo)
9. Tempo de leitura estimado (ex: "8 min")
10. Related topics: 3 temas relacionados para artigos futuros

IMPORTANTE:
- Escreva em português brasileiro formal mas acessível
- Foque em informação médica precisa e confiável
- Inclua dados estatísticos quando relevante (ex: "afeta X% da população acima de 60 anos")
- Mencione que a Drudi e Almeida tem 5 unidades em SP de forma natural
- O número de WhatsApp para agendamento é (11) 91654-4653
- NÃO use markdown no conteúdo HTML, apenas tags HTML válidas

Responda APENAS com um JSON válido no seguinte formato (sem markdown, sem \`\`\`json):
{
  "slug": "string",
  "title": "string",
  "meta_title": "string",
  "meta_description": "string",
  "excerpt": "string",
  "keywords": "string",
  "read_time": "string",
  "content": "string (HTML completo)",
  "schema_faq": [{"q": "string", "a": "string"}],
  "related_topics": ["string", "string", "string"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    candidates: Array<{
      content: { parts: Array<{ text: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini retornou resposta vazia');

  // Limpar possível markdown residual
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  try {
    return JSON.parse(clean) as GeneratedArticle;
  } catch {
    throw new Error(`Falha ao parsear JSON do Gemini: ${clean.substring(0, 200)}`);
  }
}

// ─── Banco de tópicos por categoria ─────────────────────────────────────────
export const TOPIC_BANK: Record<string, string[]> = {
  'Catarata': [
    'Cirurgia de catarata em São Paulo: tudo o que você precisa saber',
    'Catarata tem cura? Entenda o tratamento e quando operar',
    'Lentes intraoculares para catarata: monofocal, multifocal e trifocal',
    'Recuperação após cirurgia de catarata: o que esperar',
    'Catarata em jovens: causas, sintomas e tratamento',
    'Catarata e diabetes: relação e cuidados especiais',
    'Cirurgia de catarata pelo convênio em São Paulo',
    'Sintomas iniciais da catarata: como identificar',
    'Facoemulsificação: a técnica mais moderna para catarata',
    'Catarata congênita em bebês: diagnóstico e tratamento',
  ],
  'Ceratocone': [
    'Ceratocone: o que é, causas, sintomas e tratamento completo',
    'Crosslinking para ceratocone: como funciona e resultados',
    'Lentes de contato para ceratocone: tipos e adaptação',
    'Ceratocone tem cura? Entenda as opções de tratamento',
    'Anel intracorneano para ceratocone: quando é indicado',
    'Ceratocone e cirurgia refrativa: é possível operar?',
    'Diagnóstico precoce do ceratocone: exames e sinais',
    'Ceratocone grau 1, 2, 3 e 4: diferenças e tratamentos',
    'Ceratocone em adolescentes: por que aparece cedo',
    'Topografia corneana: o exame que detecta o ceratocone',
  ],
  'Glaucoma': [
    'Glaucoma: o que é, tipos, sintomas e tratamento',
    'Glaucoma tem cura? Entenda como controlar a doença',
    'Pressão ocular alta: quando é glaucoma?',
    'Colírio para glaucoma: tipos, uso correto e efeitos',
    'Cirurgia de glaucoma: quando é necessária',
    'Glaucoma de ângulo aberto vs fechado: diferenças',
    'Glaucoma e hereditariedade: quem tem mais risco',
    'Campo visual no glaucoma: o exame que monitora a doença',
    'Glaucoma em idosos: prevenção e acompanhamento',
    'Trabeculoplastia a laser para glaucoma: como funciona',
  ],
  'Retina': [
    'Descolamento de retina: sintomas, causas e tratamento urgente',
    'Degeneração macular: o que é e como tratar',
    'Retinopatia diabética: prevenção e tratamento',
    'Injeção intravítrea: para que serve e como é feita',
    'OCT de retina: o exame que salva a visão',
    'Buraco macular: sintomas, diagnóstico e cirurgia',
    'Membrana epirretiniana: o que é e quando operar',
    'Oclusão de veia da retina: causas e tratamento',
    'Vitrectomia: quando a cirurgia de retina é indicada',
    'Retina e diabetes: por que o controle glicêmico protege a visão',
  ],
  'Estrabismo': [
    'Estrabismo: o que é, tipos, causas e tratamento',
    'Cirurgia de estrabismo em adultos: vale a pena?',
    'Estrabismo em crianças: quando tratar e como',
    'Olho preguiçoso (ambliopia): diagnóstico e tratamento',
    'Óculos para estrabismo: quando são suficientes',
    'Toxina botulínica para estrabismo: como funciona',
    'Estrabismo convergente e divergente: diferenças',
    'Teste do reflexo corneal: como detectar estrabismo em bebês',
    'Estrabismo e visão dupla: relação e tratamento',
    'Recuperação após cirurgia de estrabismo: o que esperar',
  ],
};

// ─── Selecionar próximo tópico a gerar (rotação entre categorias) ─────────────
export function selectNextTopic(
  lastCategories: string[],
  usedTopics: string[]
): { topic: string; category: string } | null {
  const categories = ['Catarata', 'Ceratocone', 'Glaucoma', 'Retina', 'Estrabismo'];

  // Priorizar categoria menos usada recentemente
  const prioritized = categories.sort((a, b) => {
    const aLast = lastCategories.lastIndexOf(a);
    const bLast = lastCategories.lastIndexOf(b);
    return aLast - bLast; // menor índice = mais antiga
  });

  for (const category of prioritized) {
    const topics = TOPIC_BANK[category] ?? [];
    const available = topics.filter(t => !usedTopics.includes(t));
    if (available.length > 0) {
      return { topic: available[0], category };
    }
  }

  return null; // todos os tópicos usados
}

// ─── Gerar imagem de capa com Gemini Imagen ──────────────────────────────────
/**
 * Gera uma imagem de capa para o artigo usando Gemini Imagen 3.
 * Retorna a imagem como base64 (PNG) ou null se falhar.
 */
export async function generateCoverImageWithGemini(
  geminiApiKey: string,
  topic: string,
  category: string
): Promise<{ base64: string; mimeType: string } | null> {
  // Prompt otimizado para imagens médicas oftalmológicas profissionais
  const categoryVisuals: Record<string, string> = {
    'Catarata': 'close-up of a human eye with cloudy lens, medical illustration, ophthalmology',
    'Ceratocone': 'corneal topography map showing keratoconus, medical imaging, eye examination',
    'Glaucoma': 'optic nerve head with glaucomatous cupping, fundus photography, ophthalmology',
    'Retina': 'retinal fundus photograph showing blood vessels and optic disc, ophthalmology',
    'Estrabismo': 'eyes showing strabismus misalignment, pediatric ophthalmology, medical',
    'Saúde Ocular': 'professional eye examination with slit lamp biomicroscope, ophthalmology clinic',
  };

  const visual = categoryVisuals[category] ?? categoryVisuals['Saúde Ocular'];
  const prompt = `Professional medical photography for ophthalmology article about "${topic}". ${visual}. Clean white background, high resolution, clinical setting, Brazilian medical clinic, no text, photorealistic, 16:9 aspect ratio, soft lighting.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          safetyFilterLevel: 'block_only_high',
          personGeneration: 'allow_adult',
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[generateCoverImage] Imagen API error ${response.status}: ${err}`);
      return null;
    }

    const data = await response.json() as {
      predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
    };

    const prediction = data.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      console.error('[generateCoverImage] Nenhuma imagem retornada');
      return null;
    }

    return {
      base64: prediction.bytesBase64Encoded,
      mimeType: prediction.mimeType ?? 'image/png',
    };
  } catch (err) {
    console.error('[generateCoverImage] Erro:', err);
    return null;
  }
}
