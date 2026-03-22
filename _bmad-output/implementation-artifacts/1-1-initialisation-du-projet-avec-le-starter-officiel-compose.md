# Story 1.1 : Initialisation du projet avec le starter officiel composé

Status: review

## Story

As a développeur,
I want initialiser le projet IRIS avec la stack officielle (SvelteKit + Tauri + shadcn-svelte),
So that j'ai un squelette fonctionnel prêt pour le développement avec les conventions et la structure de dossiers définies par l'architecture.

## Acceptance Criteria

1. **AC1 — Compilation et démarrage**
   **Given** aucun projet n'existe encore
   **When** les commandes d'initialisation sont exécutées (`sv create iris`, `npm install -D @sveltejs/adapter-static`, `npx tauri init`, `npx shadcn-svelte@latest init`)
   **Then** le projet compile et démarre en mode développement (frontend + backend Tauri)
   **And** TypeScript strict est activé
   **And** Tailwind CSS v4 est configuré avec le plugin Vite natif (`@tailwindcss/vite`)
   **And** adapter-static est configuré pour le mode SPA
   **And** Vitest est configuré et un test placeholder passe
   **And** ESLint + Prettier sont configurés

2. **AC2 — Structure de dossiers**
   **Given** le projet est initialisé
   **When** je vérifie la structure de dossiers
   **Then** les dossiers suivants existent :
   - `src/lib/components/ui/`
   - `src/lib/components/gest/`
   - `src/lib/components/layout/`
   - `src/lib/features/auth/`
   - `src/lib/features/importer/`
   - `src/lib/features/explorer/`
   - `src/lib/features/comparer/`
   - `src/lib/services/`
   - `src/lib/stores/`
   - `src/lib/types/`
   - `src/lib/utils/`
   - `src/routes/login/`
   - `src/routes/importer/`
   - `src/routes/explorer/`
   - `src/routes/comparer/`
   - `src-tauri/src/commands/`
   - `src-tauri/src/db/`
   - `src-tauri/src/security/`
   - `src-tauri/src/encoding/`
   - `src-tauri/migrations/`

3. **AC3 — Tokens de design**
   **Given** le projet est initialisé
   **When** je vérifie les tokens de design
   **Then** `src/app.css` contient les tokens IRIS (convention Tailwind v4 `@theme`) :
   - Palette de couleurs (`--color-bg-primary` à `--color-accent`)
   - Couleurs sémantiques (`--color-valid`, `--color-intermediate`, `--color-invalid`, `--color-info`)
   - Couleurs de comparaison (`--color-diff-added`, `--color-diff-removed`, `--color-diff-modified`)
   - Système typographique (Inter + JetBrains Mono, échelle 11px-24px)
   - Système d'espacement (`--space-1` 4px à `--space-8` 32px)
   **And** les polices Inter et JetBrains Mono sont intégrées dans `static/fonts/`

4. **AC4 — Configuration Tauri**
   **Given** le projet est initialisé
   **When** je vérifie la configuration Tauri
   **Then** `tauri.conf.json` est configuré avec le mode Isolation Pattern
   **And** `dist-isolation/index.html` existe
   **And** le fichier `capabilities/main-window.json` existe
   **And** `CLAUDE.md` existe à la racine avec les guidelines de développement issues de l'architecture

## Tasks / Subtasks

- [x] **Task 1 : Initialiser le projet SvelteKit** (AC: #1)
  - [x] 1.1 Exécuter `npx sv create iris` avec options : SvelteKit minimal, TypeScript, Tailwind CSS, Vitest, Prettier, ESLint
  - [x] 1.2 Vérifier que Svelte 5 et SvelteKit 2 sont installés
  - [x] 1.3 Vérifier que TypeScript strict est activé dans `tsconfig.json`

- [x] **Task 2 : Configurer adapter-static en mode SPA** (AC: #1)
  - [x] 2.1 `npm install -D @sveltejs/adapter-static`
  - [x] 2.2 Configurer `svelte.config.js` avec adapter-static (fallback: `index.html` pour SPA)
  - [x] 2.3 Créer `src/routes/+layout.ts` avec `export const ssr = false;` et `export const prerender = false;`

- [x] **Task 3 : Configurer Tailwind CSS v4 avec le plugin Vite** (AC: #1, #3)
  - [x] 3.1 S'assurer que `@tailwindcss/vite` est installé (devrait l'être via `sv create`)
  - [x] 3.2 Vérifier `vite.config.ts` : `tailwindcss()` en plugin AVANT `sveltekit()` (ordre obligatoire : Tailwind doit traiter les CSS avant que SvelteKit ne les bundle)
  - [x] 3.3 Configurer `src/app.css` avec `@import "tailwindcss";` suivi des tokens design IRIS (voir section Dev Notes)
  - [x] 3.4 Supprimer toute config PostCSS (non nécessaire avec Tailwind v4 + Vite plugin)

- [x] **Task 4 : Initialiser Tauri v2** (AC: #1, #4)
  - [x] 4.1 `npx tauri init` avec : devUrl `http://localhost:5173`, frontendDist `../build`, devCommand `npm run dev`, buildCommand `npm run build`
  - [x] 4.2 Configurer Isolation Pattern dans `tauri.conf.json` : `"security": { "pattern": { "use": "isolation", "options": { "dir": "../dist-isolation" } } }`
  - [x] 4.3 Créer `dist-isolation/index.html` (page d'isolation minimale avec `freezePrototype`)
  - [x] 4.4 Créer `src-tauri/capabilities/main-window.json` avec les permissions de base (voir snippet dans Dev Notes)

- [x] **Task 5 : Initialiser shadcn-svelte** (AC: #1)
  - [x] 5.1 `npx shadcn-svelte@latest init` — base color: Slate, CSS: `src/app.css`, aliases par défaut
  - [x] 5.2 Vérifier la présence de `components.json` à la racine
  - [x] 5.3 Vérifier que le dossier `src/lib/components/ui/` est créé

- [x] **Task 6 : Créer la structure de dossiers complète** (AC: #2)
  - [x] 6.1 Créer les dossiers frontend manquants (voir liste AC2) avec `.gitkeep` dans chaque dossier vide
  - [x] 6.2 Créer les dossiers backend Rust (`src-tauri/src/commands/`, `src-tauri/src/db/`, `src-tauri/src/security/`, `src-tauri/src/encoding/`, `src-tauri/migrations/`)
  - [x] 6.3 Créer les routes SvelteKit de base (`login/+page.svelte`, `importer/+page.svelte`, `explorer/+page.svelte`, `comparer/+page.svelte`) avec contenu placeholder

- [x] **Task 7 : Intégrer les tokens de design IRIS** (AC: #3)
  - [x] 7.1 Ajouter les CSS custom properties dans `src/app.css` (palette, sémantique, comparaison, typographie, espacement)
  - [x] 7.2 Télécharger et intégrer les polices Inter (woff2) et JetBrains Mono (woff2) dans `static/fonts/`
  - [x] 7.3 Déclarer les `@font-face` dans `src/app.css`

- [x] **Task 8 : Configurer Vitest + test placeholder** (AC: #1)
  - [x] 8.1 Vérifier `vitest.config.ts` (devrait être fourni par `sv create`)
  - [x] 8.2 Créer un test placeholder `src/lib/utils/constants.ts` + `src/lib/utils/constants.test.ts` avec `MAX_LINE_LENGTH = 204`
  - [x] 8.3 Vérifier que `npm run test` passe

- [x] **Task 9 : Créer le fichier CLAUDE.md** (AC: #4)
  - [x] 9.1 Rédiger `CLAUDE.md` à la racine avec : conventions nommage, structure projet, commandes utiles, patterns obligatoires (voir section Dev Notes)

- [x] **Task 10 : Validation finale** (AC: #1, #2, #3, #4)
  - [x] 10.1 `npm run dev` démarre sans erreur
  - [x] 10.2 `npm run build` compile sans erreur
  - [x] 10.3 `npm run test` passe
  - [x] 10.4 `npm run lint` passe
  - [x] 10.5 Vérifier que tous les dossiers de AC2 existent
  - [x] 10.6 Vérifier les tokens de design dans `src/app.css`
  - [x] 10.7 Vérifier la configuration Tauri (Isolation Pattern, capabilities, dist-isolation)
  - [x] 10.8 `npm run check` (svelte-check) passe sans erreur de types

## Dev Notes

### Stack technique exacte

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Svelte** | 5.25.8+ | Framework UI |
| **SvelteKit** | 2.55.0+ | Meta-framework + routing |
| **Tauri** | v2.10.3+ | Framework desktop (backend Rust) |
| **Tailwind CSS** | v4.2.0+ | Styling (plugin Vite natif, PAS PostCSS) |
| **shadcn-svelte** | 1.1.0+ | Composants UI (Bits UI headless) |
| **adapter-static** | dernière | Mode SPA |
| **Vitest** | dernière | Tests unitaires |
| **TypeScript** | strict | Typage |

### Configuration Tailwind CSS v4 — CRITIQUE

Tailwind v4 utilise le **plugin Vite natif** (`@tailwindcss/vite`), PAS PostCSS. Configuration dans `vite.config.ts` :

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
  ],
});
```

Dans `src/app.css` :
```css
@import "tailwindcss";
/* tokens IRIS après l'import */
```

**PAS de `tailwind.config.ts`** — Tailwind v4 n'utilise plus de fichier de config séparé. Les custom properties et thème sont définis directement dans le CSS via `@theme`.

### Configuration adapter-static — CRITIQUE

`svelte.config.js` :
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html' // Mode SPA
    })
  }
};
```

`src/routes/+layout.ts` :
```typescript
export const ssr = false;
export const prerender = false;
```

### Configuration Tauri — Isolation Pattern

`tauri.conf.json` doit inclure :
```json
{
  "app": {
    "security": {
      "pattern": {
        "use": "isolation",
        "options": {
          "dir": "../dist-isolation"
        }
      },
      "csp": "default-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  },
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../build"
  }
}
```

`dist-isolation/index.html` :
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script>
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
  </script>
</head>
<body></body>
</html>
```

### Capabilities Tauri — `src-tauri/capabilities/main-window.json`

```json
{
  "identifier": "main-window",
  "description": "Permissions for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-set-title"
  ]
}
```

> Des permissions supplémentaires (dialog, fs, etc.) seront ajoutées dans les stories suivantes selon les besoins.

### Prérequis système

- **Rust** : version 1.77.2+ (requis par Tauri v2). Vérifier avec `rustc --version`.
- **Node.js** : version 18+ avec npm
- **Outils système Windows** : WebView2 (inclus dans Windows 10/11), Visual Studio Build Tools

### Tokens de design IRIS (à intégrer dans `src/app.css`)

```css
@import "tailwindcss";

@theme {
  /* Palette principale */
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-accent: #3b82f6;

  /* Couleurs sémantiques */
  --color-valid: #22c55e;
  --color-intermediate: #f59e0b;
  --color-invalid: #ef4444;
  --color-info: #3b82f6;

  /* Couleurs de comparaison */
  --color-diff-added: #22c55e;
  --color-diff-removed: #ef4444;
  --color-diff-modified: #f59e0b;

  /* Typographie */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Échelle typographique */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 20px;
  --text-2xl: 24px;

  /* Espacement */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
}

/* Font faces */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono.woff2') format('woff2');
  font-display: swap;
}
```

> **Note :** Les valeurs exactes des couleurs ci-dessus sont les valeurs de référence. Ajuster uniquement si le UX Design Specification fournit des valeurs précises différentes.

### Contenu CLAUDE.md — Template

```markdown
# IRIS - Guidelines de développement

## Commandes

- `npm run dev` — Démarrer le frontend en mode dev
- `npx tauri dev` — Démarrer l'app complète (frontend + Rust backend)
- `npm run build` — Build frontend (génère dans `build/`)
- `npx tauri build` — Build complet de l'app desktop
- `npm run test` — Lancer les tests Vitest
- `npm run lint` — Linter (ESLint)
- `npm run check` — Vérification types Svelte (svelte-check)

## Conventions de nommage

| Couche | Convention | Exemples |
|--------|-----------|----------|
| BDD SQLite | snake_case pluriel | `users`, `gest_files`, `card_schemas` |
| Rust (fonctions/variables) | snake_case | `get_individu`, `import_file` |
| Rust (structs/enums) | PascalCase | `GestFile`, `CardType` |
| TypeScript (variables/fonctions) | camelCase | `getIndividu()`, `cardSchema` |
| TypeScript (types/interfaces) | PascalCase | `GestFile`, `CardField` |
| Composants Svelte | PascalCase | `GestRawView.svelte` |
| Routes SvelteKit | kebab-case | `/login`, `/importer` |

## Structure projet

- Frontend : `src/` (SvelteKit)
- Backend Rust : `src-tauri/`
- Organisation par feature, PAS par type
- Tests co-localisés : `foo.ts` + `foo.test.ts` dans le même dossier

## Règles obligatoires

1. Rust : `thiserror` + `?` pour les erreurs, JAMAIS `unwrap()` en production
2. `#[serde(rename_all = "camelCase")]` sur toutes les structs exposées via IPC
3. Typer les commandes Tauri via tauri-specta
4. Logger via `tauri-plugin-log`, JAMAIS `println!` ou `console.log`
5. Données sensibles : `SecretString`/`Zeroizing<T>` côté Rust
6. Le frontend ne touche JAMAIS la BDD directement — tout passe par des commandes Tauri

## Dépendances clés (futures stories)

- tauri-specta v2.0.0-rc : génération types TS depuis Rust
- rusqlite + bundled-sqlcipher-vendored-openssl : BDD chiffrée
- argon2 v0.5.3 : hashing mots de passe
- keyring v3.6.3 : secrets OS
- zeroize v1.8.2 + secrecy v0.10 : protection mémoire
```

### Pages placeholder — Template

Chaque route (`login/`, `importer/`, `explorer/`, `comparer/`) doit avoir un `+page.svelte` avec un contenu minimal :

```svelte
<script lang="ts">
  // TODO: Implémenter dans les stories suivantes
</script>

<main class="flex items-center justify-center h-screen">
  <h1 class="text-2xl font-bold">Module Importer</h1>
  <!-- Remplacer "Importer" par le nom du module -->
</main>
```

### Polices — Téléchargement

- **Inter** : disponible sur Google Fonts, format woff2 variable ou static
- **JetBrains Mono** : disponible sur https://www.jetbrains.com/lp/mono/, format woff2

Télécharger les fichiers woff2 et les placer dans `static/fonts/`.

### Project Structure Notes

- La structure définie dans AC2 correspond exactement à l'architecture validée [Source: _bmad-output/planning-artifacts/architecture.md#Structure Complète du Répertoire Projet]
- Les dossiers vides doivent contenir un `.gitkeep` pour être trackés par git
- Le dossier `src/lib/components/ui/` sera peuplé par shadcn-svelte lors de l'init
- Les routes SvelteKit de base (`login/`, `importer/`, `explorer/`, `comparer/`) doivent avoir un `+page.svelte` placeholder

### Anti-patterns à éviter

- **NE PAS** créer un `tailwind.config.ts` — Tailwind v4 n'en a plus besoin
- **NE PAS** utiliser PostCSS pour Tailwind — utiliser le plugin Vite natif
- **NE PAS** configurer `frontendDist: "../dist"` — SvelteKit avec adapter-static génère dans `build/`, pas `dist/`
- **NE PAS** oublier `export const ssr = false` dans le layout racine — Tauri ne supporte pas le SSR
- **NE PAS** oublier le `fallback: 'index.html'` dans adapter-static — nécessaire pour le mode SPA
- **NE PAS** modifier les composants dans `src/lib/components/ui/` — ce sont les composants shadcn copiés, ils ne doivent pas être modifiés manuellement

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Évaluation du Starter Template] — Commandes d'initialisation exactes et justification
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Complète du Répertoire Projet] — Arborescence complète
- [Source: _bmad-output/planning-artifacts/architecture.md#Patterns d'Implémentation & Règles de Cohérence] — Conventions de nommage et patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Décisions Architecturales Fondamentales] — Stack technique et versions
- [Source: _bmad-output/planning-artifacts/epic-1-fondations-projet-authentification-scurise.md#Story 1.1] — Acceptance Criteria BDD
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience] — Design tokens et typographie
- [Web: https://v2.tauri.app/start/frontend/sveltekit/] — Guide officiel Tauri v2 + SvelteKit
- [Web: https://www.shadcn-svelte.com/docs/installation/sveltekit] — Guide shadcn-svelte 1.1.0
- [Web: https://tailwindcss.com/docs/guides/sveltekit] — Guide Tailwind CSS v4 + SvelteKit

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

- shadcn-svelte CLI interactive — contourné en créant `components.json` manuellement
- Ancien dossier `iris/` (React+Tauri) renommé en `iris-old/` avant initialisation
- Polices téléchargées depuis Google Fonts (Inter) et GitHub releases (JetBrains Mono v2.304)

### Completion Notes List

- Projet SvelteKit initialisé via `npx sv create iris` (Svelte 5.51+, SvelteKit 2.50+)
- TypeScript strict activé par défaut
- adapter-static configuré avec fallback SPA, SSR désactivé
- Tailwind CSS v4 via plugin Vite natif (pas de PostCSS, pas de tailwind.config)
- Tauri v2 initialisé avec Isolation Pattern et CSP configuré
- shadcn-svelte configuré manuellement (components.json + utilitaire cn)
- 20 dossiers créés conformément à l'architecture (AC2)
- 4 routes placeholder (login, importer, explorer, comparer)
- Tokens design IRIS intégrés dans app.css (@theme)
- Polices Inter et JetBrains Mono intégrées (woff2)
- Vitest configuré avec 1 test placeholder qui passe
- CLAUDE.md créé avec guidelines de développement
- Toutes les validations passent : dev, build, test, lint, check

### File List

**Nouveaux fichiers :**
- `iris/package.json`
- `iris/svelte.config.js`
- `iris/vite.config.ts`
- `iris/vitest.config.ts`
- `iris/tsconfig.json`
- `iris/eslint.config.js`
- `iris/.prettierrc`
- `iris/.prettierignore`
- `iris/components.json`
- `iris/CLAUDE.md`
- `iris/src/app.css`
- `iris/src/app.html`
- `iris/src/app.d.ts`
- `iris/src/routes/+layout.svelte`
- `iris/src/routes/+layout.ts`
- `iris/src/routes/+page.svelte`
- `iris/src/routes/login/+page.svelte`
- `iris/src/routes/importer/+page.svelte`
- `iris/src/routes/explorer/+page.svelte`
- `iris/src/routes/comparer/+page.svelte`
- `iris/src/lib/utils/index.ts`
- `iris/src/lib/utils/constants.ts`
- `iris/src/lib/utils/constants.test.ts`
- `iris/static/fonts/Inter.woff2`
- `iris/static/fonts/JetBrainsMono.woff2`
- `iris/dist-isolation/index.html`
- `iris/src-tauri/tauri.conf.json`
- `iris/src-tauri/Cargo.toml`
- `iris/src-tauri/build.rs`
- `iris/src-tauri/src/main.rs`
- `iris/src-tauri/src/lib.rs`
- `iris/src-tauri/capabilities/default.json`
- `iris/src-tauri/capabilities/main-window.json`
- `iris/src/lib/components/gest/.gitkeep`
- `iris/src/lib/components/layout/.gitkeep`
- `iris/src/lib/features/auth/.gitkeep`
- `iris/src/lib/features/importer/.gitkeep`
- `iris/src/lib/features/explorer/.gitkeep`
- `iris/src/lib/features/comparer/.gitkeep`
- `iris/src/lib/services/.gitkeep`
- `iris/src/lib/stores/.gitkeep`
- `iris/src/lib/types/.gitkeep`
- `iris/src-tauri/src/commands/.gitkeep`
- `iris/src-tauri/src/db/.gitkeep`
- `iris/src-tauri/src/security/.gitkeep`
- `iris/src-tauri/src/encoding/.gitkeep`
- `iris/src-tauri/migrations/.gitkeep`

### Change Log

- 2026-03-22 : Implémentation complète Story 1.1 — Initialisation du projet IRIS avec SvelteKit + Tauri v2 + shadcn-svelte + Tailwind CSS v4
