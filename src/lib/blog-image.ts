// ============================================================
// Drudi e Almeida — Geração de Imagem de Capa via Cloudflare Workers AI
// Modelo: @cf/stabilityai/stable-diffusion-xl-base-1.0
//
// PROMPT ENGINEERING v2 — Baseado em análise visual das imagens geradas
// e melhores práticas de SDXL para fotografia médica humanizada.
//
// Estrutura de prompt adotada (Reddit/Civitai best practices):
//   [STYLE] photo of [SUBJECT], [DETAILS], [ACTION/POSE], [FRAMING],
//   [SETTING], [LIGHTING], [CAMERA], [MOOD]
//
// Princípios aplicados:
//   1. HUMANIZAÇÃO — sempre incluir médico ou paciente (sem imagens vazias)
//   2. SEM TEXTO — "no text, no labels, no signs" no prompt positivo E negativo
//   3. CONTEXTO ACOLHEDOR — clínica moderna, iluminação quente/suave
//   4. EVITAR CLOSE-UPS EXTREMOS — preferir plano médio com contexto
//   5. GUIDANCE 7.0 + STEPS 28 — equilíbrio qualidade/tempo no CF Workers AI
// ============================================================

/**
 * Prompts v2 por categoria — humanizados, acolhedores e profissionais.
 * Cada prompt segue a estrutura: [STYLE] photo of [SUBJECT], [ACTION],
 * [FRAMING], [SETTING], [LIGHTING], [CAMERA PROPERTIES], [MOOD]
 */
const CATEGORY_PROMPTS: Record<string, string> = {
  Catarata: [
    'lifestyle medical photography of a smiling elderly Brazilian woman',
    'sitting in a modern ophthalmology clinic consultation room',
    'ophthalmologist in white coat explaining cataract surgery results',
    'medium shot, eye level angle',
    'bright modern clinic interior with white walls and soft natural light from window',
    'soft diffused lighting, warm tones, shallow depth of field',
    'Canon EOS 5D Mark IV, 85mm lens, f/2.8',
    'reassuring, hopeful, professional medical atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Ceratocone: [
    'lifestyle medical photography of a young Brazilian adult',
    'being examined by an ophthalmologist using a slit lamp biomicroscope',
    'medium shot, eye level',
    'modern ophthalmology clinic with blue and white decor',
    'soft clinical lighting, cool blue tones, bokeh background',
    'Canon EOS R5, 50mm lens, f/2.0',
    'focused, attentive, professional medical consultation atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Glaucoma: [
    'lifestyle medical photography of a middle-aged Brazilian man',
    'receiving eye pressure measurement from a caring ophthalmologist',
    'medium shot, slightly above eye level',
    'well-lit modern eye clinic, clean white and blue interior',
    'soft diffused lighting, calm neutral tones',
    'Fujifilm X-T4, 56mm lens, f/2.4',
    'calm, reassuring, preventive healthcare atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Retina: [
    'lifestyle medical photography of a Brazilian ophthalmologist',
    'carefully examining a patient with a fundus ophthalmoscope',
    'medium close-up, professional framing',
    'modern retina specialty clinic, dim warm lighting for examination',
    'cinematic soft lighting, deep focus on doctor and patient interaction',
    'Sony A7 III, 85mm lens, f/1.8',
    'precise, expert, specialized medical care atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Estrabismo: [
    'lifestyle medical photography of a friendly Brazilian pediatric ophthalmologist',
    'performing a gentle eye examination on a smiling child patient aged 6',
    'medium shot, warm eye level angle',
    'bright cheerful pediatric ophthalmology clinic with colorful accents',
    'soft warm natural lighting, shallow depth of field',
    'Nikon D850, 85mm lens, f/2.0',
    'gentle, caring, child-friendly medical atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  'Saúde Ocular': [
    'lifestyle medical photography of a smiling Brazilian woman in her 40s',
    'receiving a routine eye examination at a premium ophthalmology clinic',
    'medium shot, eye level, three-quarter view',
    'modern bright ophthalmology clinic with slit lamp equipment visible in background',
    'soft diffused window light, warm professional tones, bokeh background',
    'Canon EOS 5D Mark IV, 85mm lens, f/2.2',
    'welcoming, professional, preventive healthcare atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),
};

/**
 * Prompts alternativos por categoria — usados em variação para evitar
 * repetição quando múltiplos artigos da mesma categoria são gerados.
 */
const CATEGORY_PROMPTS_ALT: Record<string, string> = {
  Catarata: [
    'lifestyle medical photography of a happy elderly Brazilian man',
    'shaking hands with ophthalmologist after successful cataract surgery consultation',
    'medium shot, warm eye level angle',
    'premium ophthalmology clinic reception with modern furniture',
    'golden hour warm lighting through large windows, soft bokeh',
    'Fujifilm GFX 50S, 63mm lens, f/2.8',
    'grateful, relieved, positive medical outcome atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Ceratocone: [
    'lifestyle medical photography of a young Brazilian woman',
    'trying on specialty contact lenses with guidance from an ophthalmologist',
    'medium close-up, slightly above eye level',
    'modern ophthalmology clinic with clean white and teal decor',
    'soft diffused clinical lighting, cool tones',
    'Canon EOS R6, 85mm lens, f/2.0',
    'attentive, hopeful, specialized care atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Glaucoma: [
    'lifestyle medical photography of a senior Brazilian woman',
    'having a detailed eye consultation with an ophthalmologist reviewing results',
    'medium shot, eye level',
    'modern eye clinic consultation room, clean professional interior',
    'soft neutral lighting, professional medical atmosphere',
    'Sony A7R IV, 85mm lens, f/2.0',
    'attentive, preventive, professional medical care atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Retina: [
    'lifestyle medical photography of a Brazilian diabetic patient in their 50s',
    'receiving retinal examination from a specialist ophthalmologist',
    'medium shot, slightly low angle showing care and expertise',
    'specialized retina clinic with modern diagnostic equipment',
    'soft warm clinical lighting, professional atmosphere',
    'Nikon Z7 II, 85mm lens, f/2.0',
    'expert, specialized, attentive medical care atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  Estrabismo: [
    'lifestyle medical photography of a Brazilian mother',
    'watching with relief as ophthalmologist examines her child with strabismus',
    'medium wide shot, warm eye level',
    'bright pediatric ophthalmology clinic with toys and colorful walls',
    'soft warm natural lighting, shallow depth of field',
    'Canon EOS 5D Mark IV, 50mm lens, f/2.4',
    'reassuring, family-centered, caring medical atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),

  'Saúde Ocular': [
    'lifestyle medical photography of a Brazilian couple in their 50s',
    'leaving ophthalmology clinic smiling after successful eye examination',
    'medium shot, natural outdoor clinic entrance',
    'modern premium ophthalmology clinic exterior with glass facade',
    'bright natural daylight, warm tones, shallow depth of field',
    'Leica SL2, 50mm lens, f/2.0',
    'satisfied, healthy, positive preventive healthcare atmosphere',
    'no text, no labels, no signs, no watermark',
  ].join(', '),
};

/**
 * Negative prompt v2 — expandido para eliminar os principais problemas
 * identificados na análise visual: texto ilegível, imagens perturbadoras,
 * close-ups extremos de anatomia, composições confusas.
 */
const NEGATIVE_PROMPT = [
  // Artefatos de texto (problema crítico identificado)
  'text, letters, words, labels, signs, captions, watermark, logo, typography, numbers, digits',
  // Qualidade
  'blurry, low quality, pixelated, grainy, noisy, compression artifacts, overexposed, underexposed',
  // Estilos indesejados
  'cartoon, illustration, drawing, anime, painting, sketch, 3d render, CGI, digital art',
  // Conteúdo perturbador (problema crítico identificado)
  'scary, disturbing, grotesque, horror, blood, gore, violence, nsfw, nudity',
  // Close-ups extremos de anatomia (problema crítico identificado)
  'extreme close-up of eye, isolated eyeball, dissected anatomy, medical diagram, chart, graph',
  // Composições confusas (problema identificado)
  'collage, multiple images, grid layout, split screen, montage, overlapping images',
  // Outros
  'deformed, mutated, bad anatomy, extra limbs, missing limbs, disfigured',
].join(', ');

/**
 * Seleciona o prompt com base na categoria e em um hash do slug
 * para garantir variação entre artigos da mesma categoria.
 */
function selectPrompt(category: string, slug: string): string {
  const normalized = category.trim();
  const primary = CATEGORY_PROMPTS[normalized] ?? CATEGORY_PROMPTS['Saúde Ocular'];
  const alt = CATEGORY_PROMPTS_ALT[normalized] ?? CATEGORY_PROMPTS_ALT['Saúde Ocular'];

  // Usar hash simples do slug para alternar entre prompts primário e alternativo
  const hashSum = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hashSum % 2 === 0 ? primary : alt;
}

/**
 * Gera uma imagem de capa para o artigo usando Cloudflare Workers AI (SDXL).
 * Retorna a imagem como ArrayBuffer (PNG) ou null se falhar.
 *
 * @param ai - O binding AI do Cloudflare Workers
 * @param category - Categoria do artigo (Catarata, Retina, etc.)
 * @param title - Título do artigo (não mais usado no prompt — evita artefatos)
 * @param slug - Slug do artigo (usado para seleção de variante de prompt)
 */
export async function generateCoverImage(
  env: unknown,
  category: string,
  title: string,
  slug = ''
): Promise<ArrayBuffer | null> {
  const prompt = selectPrompt(category, slug || title);

  // Acessar o binding AI via env como Record para garantir compatibilidade
  // com o runtime do Cloudflare Workers (binding não funciona como parâmetro direto)
  const aiBinding = (env as Record<string, Ai>)['AI'];
  if (!aiBinding) {
    console.error('[generateCoverImage] AI binding não encontrado no env');
    return null;
  }

  try {
    const response = await aiBinding.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt,
      negative_prompt: NEGATIVE_PROMPT,
      // v2: 28 steps (vs 20 anterior) — melhor qualidade sem timeout no CF Workers
      num_steps: 28,
      // v2: guidance 7.0 (vs 7.5 anterior) — menos "over-saturation", mais natural
      guidance: 7.0,
      // Mantém 1024×576 (16:9) — ideal para cards de blog
      width: 1024,
      height: 576,
    });

    // CF Workers AI SDXL retorna ReadableStream no runtime do Cloudflare Workers
    // IMPORTANTE: verificar ReadableStream PRIMEIRO (antes de arrayBuffer)
    // pois ReadableStream tem arrayBuffer() mas ele não funciona como esperado
    if (response instanceof ReadableStream) {
      const reader = response.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result.buffer;
    }
    // Caso 2: ArrayBuffer direto
    if (response instanceof ArrayBuffer) {
      return response;
    }
    // Caso 3: Uint8Array ou TypedArray
    if (response && (response as any).buffer instanceof ArrayBuffer) {
      return (response as any).buffer;
    }
    // Caso 4: Response HTTP (fallback)
    if (response && typeof (response as any).arrayBuffer === 'function') {
      return await (response as any).arrayBuffer();
    }
    console.error('[generateCoverImage] Resposta inesperada:', typeof response);
    return null;
  } catch (err) {
    console.error('[generateCoverImage] Erro ao gerar imagem:', err);
    return null;
  }
}

/**
 * Converte um ArrayBuffer de imagem para uma data URL base64.
 * Útil para armazenar diretamente no banco como fallback.
 */
export function imageBufferToDataUrl(buffer: ArrayBuffer, mimeType = 'image/png'): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Faz upload da imagem para o KV do Cloudflare e retorna a URL de acesso.
 * A imagem fica disponível em /api/blog/image/{key}
 */
export async function uploadImageToKV(
  kv: KVNamespace,
  imageBuffer: ArrayBuffer,
  slug: string
): Promise<string> {
  const key = `blog-img:${slug}`;
  await kv.put(key, imageBuffer, {
    expirationTtl: 60 * 60 * 24 * 365, // 1 ano
    metadata: { contentType: 'image/png', slug },
  });
  return `/api/blog/image/${encodeURIComponent(slug)}`;
}
