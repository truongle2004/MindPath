import type { MetadataRoute } from 'next';
import { getBaseUrl, getI18nPath } from '@/lib/Helpers';
import { routing } from '@/lib/I18nRouting';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  const routes = [''];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales
          .filter((locale) => locale !== routing.defaultLocale)
          .map((locale) => [locale, `${baseUrl}${getI18nPath(route, locale)}`]),
      ),
    },
  }));
}
