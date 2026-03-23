# IRIS - Guidelines de développement

## Commandes

- `npm run dev` — Démarrer le frontend en mode dev
- `npx tauri dev` — Démarrer l'app complète (frontend + Rust backend)
- `npm run build` — Build frontend (génère dans `build/`)
- `npx tauri build` — Build complet de l'app desktop
- `npm run test` — Lancer les tests Vitest
- `npm run lint` — Linter (Prettier + ESLint)
- `npm run check` — Vérification types Svelte (svelte-check)

## Conventions de nommage

| Couche                           | Convention         | Exemples                              |
| -------------------------------- | ------------------ | ------------------------------------- |
| BDD SQLite                       | snake_case pluriel | `users`, `gest_files`, `card_schemas` |
| Rust (fonctions/variables)       | snake_case         | `get_individu`, `import_file`         |
| Rust (structs/enums)             | PascalCase         | `GestFile`, `CardType`                |
| TypeScript (variables/fonctions) | camelCase          | `getIndividu()`, `cardSchema`         |
| TypeScript (types/interfaces)    | PascalCase         | `GestFile`, `CardField`               |
| Composants Svelte                | PascalCase         | `GestRawView.svelte`                  |
| Routes SvelteKit                 | kebab-case         | `/login`, `/importer`                 |

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

> Les versions ci-dessous sont indicatives. Vérifier les versions disponibles au moment de l'implémentation.

- tauri-specta v2.0.0-rc : génération types TS depuis Rust
- rusqlite + bundled-sqlcipher-vendored-openssl : BDD chiffrée
- argon2 v0.5.3 : hashing mots de passe
- keyring v3.6.3 : secrets OS
- zeroize v1.8.2 + secrecy v0.10 : protection mémoire
