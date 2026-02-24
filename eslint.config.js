import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Composants UI (shadcn) et API Vercel - règles assouplies
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'api/**/*.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/purity': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Contextes, hooks, lib (export de hooks/constantes) - ne pas bloquer le build
  {
    files: ['src/contexts/**/*.tsx', 'src/hooks/**/*.ts', 'src/lib/categoryIcons.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  // App.tsx - useMemo avec filterAndSortCategories (déclaré dans le composant)
  {
    files: ['src/App.tsx'],
    rules: {
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
