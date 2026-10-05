import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match root path
    "/",
    // Match all pathnames with supported locales
    "/(ar|en)/:path*",
    // Match all other paths except static files, api, _next, favicon
    "/((?!api|_next|_vercel|assets|favicon\\.ico|favicon\\.png|apple-touch-icon\\.png|.*\\..*).*)",
  ],
};
