import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { verifyAdminToken, getAdminTokenFromRequest } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const cfEnv = env as unknown as Env;

  // Injetar cfEnv nos locals para uso nas páginas .astro
  (context.locals as Record<string, unknown>).cfEnv = cfEnv;

  // Proteger rotas /admin/* (exceto /admin/login e /api/admin/login)
  const { pathname } = new URL(context.request.url);
  const isAdminPage = pathname.startsWith("/admin/") && !pathname.startsWith("/admin/login");

  if (isAdminPage) {
    const token = getAdminTokenFromRequest(context.request);
    if (!token || !(await verifyAdminToken(cfEnv.ADMIN_JWT_SECRET, token))) {
      return context.redirect("/admin/login");
    }
  }

  return next();
});
