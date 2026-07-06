import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    'src/libs/I18n.ts',
    'src/types/I18n.ts',
    'src/components/Whiteboard.tsx',
    'src/libs/I18nNavigation.ts',
    'src/utils/supabase/client.ts',
    'src/utils/supabase/middleware.ts',
    'src/core/entities/errors/unauthorized-error.ts',
    'src/core/entities/errors/input-parse-error.ts',
    'src/core/entities/errors/not-found-error.ts',
  ],
  // Dependencies to ignore during analysis
  ignoreDependencies: [
    '@clerk/shared',
    '@swc/helpers', // Avoid error in CI: "`npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync."
    '@excalidraw/excalidraw',
    '@hookform/resolvers',
    'react-hook-form',
  ],
  // Binaries to ignore during analysis
  ignoreBinaries: [],
  // Shadcn UI components export variants and subcomponents for reuse
  ignoreIssues: {
    'src/components/ui/**': ['exports'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
