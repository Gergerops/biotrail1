import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  // Vercel serverless adapter — required for the API route (/api/capture)
  // to handle form submissions. The marketing pages themselves are statically
  // pre-rendered (see `prerender = true` in src/pages/[lang]/index.astro).
  output: 'hybrid',
  adapter: vercel(),

  // i18n routing.
  // - default locale `en` lives at `/en/...`
  // - `de` lives at `/de/...`
  // - `tr`, `ar`, `uk` are reserved for phase 2; the LangSwitch shows them
  //   as "soon" and they fall back to `/en` if visited.
  // - `prefixDefaultLocale: true` means we always show the locale in the URL,
  //   which is cleaner for SEO and analytics segmentation.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },

  site: 'https://biotrail.com',
});
