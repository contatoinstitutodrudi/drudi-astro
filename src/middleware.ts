import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { verifyAdminToken, getAdminTokenFromRequest } from "./lib/auth";

// Redirecionamentos 301 permanentes para URLs antigas indexadas pelo Google Search Console
// Problema: "Cópia — o Google e o usuário selecionaram uma canônica diferente"
const PERMANENT_REDIRECTS: Record<string, string> = {
  '/blog/cirurgia-catarata-sp':           '/blog/cirurgia-catarata-sp-preco/',
  '/blog/cirurgia-catarata-sp/':          '/blog/cirurgia-catarata-sp-preco/',
  '/blog/ceratocone-sintomas-tratamento': '/blog/crosslinking-ceratocone-sp/',
  '/blog/ceratocone-sintomas-tratamento/':'/blog/crosslinking-ceratocone-sp/',
  '/blog/ceratocone-tratamento':          '/blog/crosslinking-ceratocone-sp/',
  '/blog/ceratocone-tratamento/':         '/blog/crosslinking-ceratocone-sp/',
};

export const onRequest = defineMiddleware(async (context, next) => {
  const cfEnv = env as unknown as Env;

  // Injetar cfEnv nos locals para uso nas páginas .astro
  (context.locals as Record<string, unknown>).cfEnv = cfEnv;

  const { pathname } = new URL(context.request.url);

  // Aplicar redirecionamentos 301 para URLs antigas
  if (PERMANENT_REDIRECTS[pathname]) {
    return new Response(null, {
      status: 301,
      headers: {
        'Location': PERMANENT_REDIRECTS[pathname],
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }

  // Proteger rotas /admin/* (exceto /admin/login e /api/admin/login)
  const isAdminPage = pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login");

  if (isAdminPage) {
    const token = getAdminTokenFromRequest(context.request);
    if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
      return context.redirect("/admin/login");
    }
  }

  return next();
});
