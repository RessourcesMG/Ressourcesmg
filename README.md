# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Espace Webmaster

Pour ajouter des ressources **de manière durable** (stockées en base de données) :

1. **Supabase** : créez un projet gratuit sur [supabase.com](https://supabase.com)
   - Exécutez les scripts `supabase/schema.sql` et `supabase/schema-analytics.sql` dans SQL Editor
   - Dans Settings > API : copiez l'URL et la clé `service_role`
2. **Vercel** : ajoutez les variables d'environnement :
   - `WEBMASTER_PASSWORD` : votre mot de passe
   - `WEBMASTER_SECRET` : secret pour signer les sessions (obligatoire en production)
   - `SUPABASE_URL` : l'URL du projet
   - `SUPABASE_SERVICE_ROLE_KEY` : la clé service_role
3. Accédez à `/webmaster`, connectez-vous et ajoutez vos ressources

Les ressources sont stockées dans Supabase et visibles par tous les visiteurs.

**En local** : `npm run dev:api` puis `npm run dev`. Sans Supabase, les ressources sont en mémoire (perdues au redémarrage).

## Fonctionnalités avancées

- **PWA** : application installable, mise à jour automatique du service worker
- **Analytics** : tableau de bord dans l'espace webmaster (clics ressources, recherches populaires)
- **Notifications email** : variables `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY` + `NOTIFICATION_EMAIL` pour recevoir un email à chaque nouvelle proposition (gratuit avec EmailJS, sans domaine requis)
- **Validation des URLs** : vérification que le lien est accessible avant d'accepter une proposition
- **Protection anti-spam** : honeypot sur le formulaire de proposition
- **Sitemap dynamique** : `/sitemap.xml` généré à partir des catégories Supabase
- **Schema.org** : données structurées ItemList pour le SEO
