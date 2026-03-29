/**
 * Endpoint temporário para testar os novos prompts v2 sem alterar o banco.
 * POST /api/admin/blog/test-prompt
 * Body: { category: string }
 * Retorna a imagem gerada diretamente como PNG.
 */
import type { APIRoute } from 'astro';
import { env as cfEnv } from 'cloudflare:workers';
export const prerender = false;
import { getAdminTokenFromRequest, verifyAdminToken } from '../../../../lib/auth';
import { generateCoverImage } from '../../../../lib/blog-image';
export const POST: APIRoute = async ({ request }) => {
  const env = cfEnv as unknown as Env;;

  // Validar autenticação admin
  const token = getAdminTokenFromRequest(request);
  const secret = (env as any).ADMIN_JWT_SECRET ?? '';
  const isValid = token ? await verifyAdminToken(secret, token) : false;
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verificar binding AI
  if (!env.AI) {
    return new Response(JSON.stringify({ error: 'AI binding não disponível' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { category?: string; slug?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const category = body.category ?? 'Saúde Ocular';
  const slug = body.slug ?? `test-${Date.now()}`;

  try {
    // Leitura direta do ReadableStream do SDXL para diagnóstico
    const aiBinding = (env as unknown as Record<string, Ai>)['AI'];
    const rawResp = await aiBinding.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt: 'a simple blue circle on white background, minimal',
      num_steps: 5,
      width: 512,
      height: 512,
    } as any);
    // Ler o ReadableStream diretamente
    let imageBuffer: ArrayBuffer | null = null;
    if (rawResp instanceof ReadableStream) {
      const reader = rawResp.getReader();
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
      imageBuffer = result.buffer;
    } else if (rawResp instanceof ArrayBuffer) {
      imageBuffer = rawResp;
    } else if (rawResp && (rawResp as any).buffer instanceof ArrayBuffer) {
      imageBuffer = (rawResp as any).buffer;
    }
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return new Response(JSON.stringify({
        error: 'Buffer vazio ou nulo',
        type: typeof rawResp,
        isRS: rawResp instanceof ReadableStream,
        byteLength: imageBuffer?.byteLength ?? -1,
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="${slug}.png"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[test-prompt] Erro:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
