import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/Helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard',
    },
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
