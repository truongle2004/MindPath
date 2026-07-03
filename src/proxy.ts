import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import type { NextProxy } from 'next/server';
import { NextResponse } from 'next/server';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

/** Matches dashboard routes that require authentication. */
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/:locale/dashboard(.*)']);

/** Matches sign-in and sign-up routes. */
const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
]);

/** Matches locale home routes. */
const isHomePage = createRouteMatcher([
  '/',
  ...routing.locales
    .filter((locale) => locale !== routing.defaultLocale)
    .map((locale) => `/${locale}`),
]);

/** Matches locale about routes. */
const isAboutPage = createRouteMatcher(['/about(.*)', '/:locale/about(.*)']);

/**
 * Resolves the active locale from a pathname.
 * @param pathname The request pathname.
 * @returns The matched locale or the default locale.
 */
function getLocaleFromPathname(pathname: string): string {
  const segment = pathname
    .split('/')
    .filter(Boolean)
    .find((part) => routing.locales.includes(part));

  if (segment) {
    return segment;
  }

  return routing.defaultLocale;
}

/**
 * Builds a locale-aware path using the same rules as getI18nPath.
 * @param path The base application-relative path starting with a slash.
 * @param locale The active locale identifier.
 * @returns The localized path, prefixed when the locale is not the default locale.
 */
function getLocalizedPath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) {
    return path;
  }

  return `/${locale}${path}`;
}

/**
 * Arcjet client with bot protection rules for middleware.
 * Allows search engines, preview links, and uptime monitors; blocks other bots.
 */
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
  }),
);

/**
 * Runs Arcjet bot protection, Clerk auth, and next-intl routing for incoming requests.
 * Clerk middleware runs only on auth, dashboard, home, and about routes because keyless mode does not work with i18n.
 * Uses `process.env` instead of Env to reduce middleware bundle size.
 * @param request The incoming Next.js request.
 * @param event The fetch event for middleware composition.
 * @returns The middleware response for the request.
 */
const proxy: NextProxy = async (request, event) => {
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (
    isAuthPage(request) ||
    isProtectedRoute(request) ||
    isHomePage(request) ||
    isAboutPage(request)
  ) {
    // Match Clerk's documented middleware composition pattern, `return await` is not necessary.
    // oxlint-disable-next-line typescript/return-await
    return clerkMiddleware(async (auth, req): Promise<NextResponse> => {
      if (isProtectedRoute(req)) {
        const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/u)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      if (isAuthPage(req) || isHomePage(req) || isAboutPage(req)) {
        const { userId } = await auth();

        if (userId) {
          const locale = getLocaleFromPathname(req.nextUrl.pathname);
          const dashboardPath = getLocalizedPath('/dashboard', locale);

          return NextResponse.redirect(new URL(dashboardPath, req.url));
        }
      }

      return handleI18nRouting(req);
    })(request, event);
  }

  return handleI18nRouting(request);
};

export default proxy;

/**
 * Middleware matcher config.
 * Excludes Next.js internals, Vercel, monitoring, API routes, and static files with extensions.
 */
export const config = {
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};
