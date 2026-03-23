# IRIS

Application desktop de recherche généalogique, construite avec SvelteKit + Tauri v2 (Rust).

## Prérequis

- [Node.js](https://nodejs.org/) >= 20.19.0
- [Rust toolchain](https://rustup.rs/) (stable)
- [Tauri CLI](https://tauri.app/start/prerequisites/) : `npm install -g @tauri-apps/cli`

## Commandes essentielles

```sh
# Installer les dépendances frontend
npm install

# Démarrer le frontend seul (SvelteKit)
npm run dev

# Démarrer l'application complète (frontend + backend Rust)
npx tauri dev

# Build de l'application desktop
npx tauri build

# Linter (Prettier + ESLint)
npm run lint

# Vérification des types Svelte
npm run check

# Lancer les tests
npm run test
```

## Architecture

- `src/` — Frontend SvelteKit (TypeScript, Tailwind CSS v4)
- `src-tauri/` — Backend Rust (Tauri v2)
- Le frontend communique avec le backend exclusivement via des commandes Tauri (IPC)
- Organisation du code par feature, pas par type de fichier
