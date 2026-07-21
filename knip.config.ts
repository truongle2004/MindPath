import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Files to exclude from Knip analysis
  ignore: [
    '.codex/skills/**',
    'src/lib/I18n.ts',
    'src/types/I18n.ts',
    'src/components/Whiteboard.tsx',
    'src/lib/I18nNavigation.ts',
    'src/lib/errors/unauthorized-error.ts',
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
    'src/lib/Fetcher.ts': ['exports'],
    'src/modules/flashcard/entities/models/card.schema.ts': ['exports', 'types'],
    'src/modules/flashcard/application/repositories/card.repository.interface.ts': ['types'],
  },
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/gu)].join('\n'),
  },
  treatConfigHintsAsErrors: true,
};

export default config;
