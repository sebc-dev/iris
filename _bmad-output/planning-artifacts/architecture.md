---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-22'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - 'docs/ux_recherche.md'
  - 'docs/architecture_securite.md'
workflowType: 'architecture'
project_name: 'iris_research'
user_name: 'Negus'
date: '2026-03-22'
---

# Architecture Decision Document

_Ce document se construit collaborativement à travers une découverte étape par étape. Les sections sont ajoutées au fur et à mesure de chaque décision architecturale._

## Analyse du Contexte Projet

### Vue d'Ensemble des Exigences

**Exigences Fonctionnelles :**
44 exigences (FR1-FR44) réparties en 7 domaines :
- Gestion des utilisateurs (FR1-FR4) : authentification locale, cloisonnement
- Import & Analyse (FR5-FR12) : import fichier, validation multi-niveaux, décodage 31 types de cartes
- Gestion des bandes GEST (FR44) : suppression d'une bande importée et de toutes ses données associées
- Visualisation (FR13-FR18) : affichage structuré, navigation hiérarchique 5 niveaux, filtrage
- Modification (FR19-FR23) : édition contrainte par plage, validation temps réel, intégrité 204 caractères
- Comparaison (FR24-FR33) : appariement par clés, détection d'écarts champ par champ, gestion orphelins/doublons
- Export (FR34-FR38) : export GEST (Windows-1252), export Excel comparaison
- Persistance & Sécurité (FR39-FR43) : SQLite chiffré, zeroize mémoire

**Exigences Non-Fonctionnelles :**
15 exigences (NFR1-NFR15) :
- Performance (NFR1-NFR6) : import 10k lignes < 5s, comparaison < 10s, navigation < 200ms, validation < 100ms
- Sécurité (NFR7-NFR12) : chiffrement at-rest, hashing mots de passe, nettoyage mémoire, cloisonnement, conformité RGPD
- Accessibilité (NFR13-NFR15) : WCAG 2.1 A, navigation clavier, contrastes

**Échelle & Complexité :**
- Domaine principal : Application desktop full-stack (Rust + Svelte)
- Niveau de complexité : Élevé
- Composants architecturaux estimés : ~12-15 (modules UI, services Rust, couche données, couche sécurité)

### Contraintes Techniques & Dépendances

- **Tauri (dernière version)** — Framework desktop imposé (continuité du prototype)
- **Svelte/SvelteKit** — Migration depuis React (prototype v0.1.5)
- **SQLite + SQLCipher** — Base locale chiffrée, pas de serveur distant
- **Windows-1252** — Encodage non-UTF8 des fichiers GEST, gestion transparente requise
- **Format GEST 204 caractères/ligne** — 31 types de cartes avec schémas déclaratifs
- **Windows prioritaire** — MVP cible l'environnement administration française
- **Développeur solo** — Scope MVP ambitieux mais sans fonctionnalités "nice-to-have"
- **Architecture sécurité validée** — Le document architecture_securite.md fournit les choix techniques complets : Argon2id, rusqlite+SQLCipher (bundled-sqlcipher-vendored-openssl), keyring v3.6.3, Isolation Pattern, secrecy/zeroize

### Préoccupations Transversales Identifiées

1. **Sécurité & Chiffrement** — Traverse toutes les couches : authentification, stockage, mémoire, IPC, export
2. **Validation du format GEST** — Import, édition, export : validation multi-niveaux omniprésente
3. **Gestion d'encodage Windows-1252** — Import et export doivent préserver l'encodage
4. **Performance sur fichiers volumineux** — Décision Rust vs JS pour la logique métier (parsing, validation, comparaison)
5. **Accessibilité (WCAG 2.1 A)** — Double encodage couleur+symbole, navigation clavier, contrastes
6. **Synchronisation UI** — Panneaux synchronisés, arbre ↔ vue centrale ↔ vue brute ↔ breadcrumbs

## Évaluation du Starter Template

### Domaine Technologique Principal

Application desktop full-stack : Tauri (Rust backend) + SvelteKit (frontend) — identifié à partir de l'analyse des exigences projet.

### Options de Starter Évaluées

**Option A — Approche officielle composée (retenue)**
Utilisation séquentielle des CLI officiels : `sv create` → `tauri init` → `shadcn-svelte init`. Contrôle total, versions à jour, configuration officielle.

**Option B — Community boilerplate (tauri-sveltekit-tailwind-boilerplate)**
Template pré-configuré avec Tauri v2 + SvelteKit + Tailwind. Écarté : versions potentiellement en retard, opinions intégrées non maîtrisées, maintenance dépendante d'un contributeur unique.

**Option C — create-tauri-app seul**
Fournit Svelte simple, pas SvelteKit. Écarté : pas de routing, pas d'adapter-static, nécessiterait de reconstruire la structure SvelteKit manuellement.

### Starter Sélectionné : Approche Officielle Composée

**Justification :**
- Reproductible — Chaque commande est documentée, aucune dépendance à un template tiers
- À jour — Les CLI officiels installent toujours les dernières versions stables
- Contrôle total — On choisit exactement les add-ons nécessaires sans baggage
- Aligné avec la documentation officielle Tauri pour SvelteKit

**Commande d'Initialisation :**

```bash
# 1. Créer le projet SvelteKit
npx sv create iris
# Options : SvelteKit minimal, TypeScript, Tailwind CSS, Vitest, Prettier, ESLint

# 2. Installer adapter-static pour mode SPA
cd iris
npm install -D @sveltejs/adapter-static

# 3. Initialiser Tauri
npx tauri init
# devPath: http://localhost:5173
# distDir: ../build
# devCommand: npm run dev
# buildCommand: npm run build

# 4. Ajouter shadcn-svelte
npx shadcn-svelte@latest init
```

**Décisions Architecturales Fournies par le Starter :**

**Langage & Runtime :**
TypeScript strict, Svelte 5 (5.25.8+), SvelteKit 2.55.0

**Solution de Styling :**
Tailwind CSS v4.2.0 (plugin Vite natif, sans PostCSS), CSS-in-template

**Outillage de Build :**
Vite (via SvelteKit), @sveltejs/adapter-static pour SSG/SPA, Tauri v2.10.3 pour le build desktop

**Framework de Tests :**
Vitest pour les tests unitaires et d'intégration

**Organisation du Code :**
Convention SvelteKit (`src/routes/`, `src/lib/`, `src-tauri/` pour le backend Rust)

**Expérience de Développement :**
Hot reload via Vite, TypeScript strict, ESLint + Prettier, shadcn-svelte 1.0.9 (composants copiés dans le projet, Bits UI headless)

**Note :** L'initialisation du projet avec ces commandes doit être la première story d'implémentation.

## Décisions Architecturales Fondamentales

### Analyse de Priorité des Décisions

**Décisions Critiques (bloquent l'implémentation) :**
- Approche hybride progressive (TypeScript-first + noyau Rust ciblé)
- Stockage hybride BDD (lignes brutes + champs décodés)
- Schémas GEST en base SQLite (configurables)
- Cloisonnement par user_id dans une base unique
- Commandes Tauri fines (une par opération)

**Décisions Importantes (façonnent l'architecture) :**
- State management : Svelte 5 runes + stores contextuels
- Routing SvelteKit classique par module
- Virtualisation des listes longues
- CI/CD GitHub Actions
- Logging unifié tauri-plugin-log

**Décisions Différées (post-MVP) :**
- Migration de traitements TS vers Rust (si seuils de performance dépassés)
- Support Linux/macOS
- Auto-update (tauri-plugin-updater)
- SSO / LDAP

### Architecture des Données

**Modèle de stockage : Hybride (ligne brute + champs décodés)**
- Chaque ligne importée est stockée sous sa forme brute (204 caractères) ET sous forme de champs décodés en colonnes
- Justification : la ligne brute garantit un export fidèle, les champs décodés permettent navigation/édition/comparaison rapide
- Affecte : import, édition, export, comparaison

**Schémas des types de cartes : En base SQLite**
- Les 31 types de cartes GEST et leurs définitions (positions, formats, valeurs autorisées) sont stockés en base SQLite
- Justification : permet la modification des schémas depuis l'application (post-MVP), facilite l'évolution du format GEST
- Affecte : parsing, validation, édition, UI

**Cloisonnement des données : user_id dans une base unique**
- Une seule base SQLite chiffrée, chaque enregistrement associé à un user_id
- Filtrage systématique par user_id dans toutes les requêtes
- Justification : plus simple à gérer pour un développeur solo, cloisonnement suffisant avec chiffrement at-rest
- Affecte : toutes les requêtes BDD, authentification

**Migrations BDD : Crate Rust dédié**
- Utilisation d'un crate de migration (refinery v0.9.0 ou rusqlite_migration v2.4.1) pour gérer l'évolution du schéma
- Justification : migrations versionnées, reproductibles, appliquées automatiquement au démarrage
- Affecte : déploiement, mise à jour

### Authentification & Sécurité

**Stack sécurité complète (validée par architecture_securite.md) :**
- Hashing : argon2 v0.5.3 (Argon2id)
- Chiffrement BDD : rusqlite v0.38.0 + bundled-sqlcipher-vendored-openssl
- Secrets OS : keyring v3.6.3 (DPAPI/Keychain/Secret Service)
- Key wrapping : KEK aléatoire dans keychain + clé wrappée sur disque (aes-gcm)
- Protection mémoire : zeroize v1.8.2 + secrecy v0.10
- IPC : Isolation Pattern + CSP strict + freezePrototype
- Affecte : toutes les couches

### Communication Frontend ↔ Backend (IPC Tauri)

**Approche hybride progressive (TypeScript-first + noyau Rust ciblé)**
- Rust obligatoire : SQLCipher, encodage Windows-1252 (encoding_rs), keyring/secrets, zeroize/secrecy, requêtes BDD
- TypeScript : parsing positionnel, validation schéma 31 types, édition champs, comparaison, reconstruction lignes, state UI
- Migration vers Rust : uniquement si seuils dépassés (parsing > 200ms, fichiers > 50k lignes)
- Justification : maximise productivité solo + maintenabilité, Rust cantonné au périmètre incompressible (~500-1000 lignes MVP)
- Source : docs/rust_ts.md (analyse détaillée avec benchmarks et retours d'expérience)

**Commandes Tauri : Fines (une par opération)**
- ~15-25 commandes au MVP, organisées en modules Rust (commands/auth.rs, commands/gest.rs, commands/file.rs, commands/compare.rs)
- Justification : sécurité (capabilities granulaires), testabilité unitaire, typage fort via tauri-specta, adapté à Claude Code
- Affecte : API IPC, capabilities, typage TypeScript

**Génération de types : tauri-specta v2.0.0-rc**
- Génération automatique des bindings TypeScript depuis les commandes Rust
- Justification : type-safety end-to-end Rust↔TypeScript, zéro divergence

### Architecture Frontend

**State management : Svelte 5 runes + stores contextuels**
- État UI local : runes Svelte 5 ($state, $derived)
- État partagé critique : stores dédiés injectés via contexte Svelte (fichier couvert, session, mode édition, modifications pendantes)
- Justification : léger, natif Svelte, pas de librairie externe
- Affecte : tous les composants UI

**Routing : Routes classiques SvelteKit**
- Routes par module : /login, /importer, /explorer, /comparer
- Layouts partagés pour la structure commune (sidebar, breadcrumbs)
- Justification : exploite le routing natif SvelteKit, isolation des modules, layouts partagés
- Affecte : navigation, structure des composants

**Listes longues : Virtualisation**
- Rendu virtualisé pour les listes de 10 000+ lignes (librairie à déterminer à l'implémentation)
- Justification : performance DOM, NFR2 (affichage < 500ms), NFR3 (navigation < 200ms)
- Affecte : liste des lignes, arbre hiérarchique, grille de comparaison

### Infrastructure & Déploiement

**CI/CD : GitHub Actions**
- Pipeline : build Windows + cargo test + vitest + cargo audit + cargo deny
- Justification : protection contre les régressions même en solo, audit de sécurité automatique
- Affecte : workflow de développement, qualité

**Distribution : Installeur NSIS/MSI via Tauri bundler**
- Installeur Windows natif généré par le bundler Tauri intégré
- Justification : standard attendu en environnement administration, requis par le PRD
- Affecte : déploiement, mise à jour

**Logging : tauri-plugin-log v2.8.0**
- Bridge unifié Rust + JavaScript, basé sur tracing
- Justification : logs structurés depuis les deux côtés, format unifié, cibles configurables (fichier, stdout, webview console)
- Affecte : debugging, audit, conformité RGPD (journalisation des accès)

### Analyse d'Impact des Décisions

**Séquence d'Implémentation :**
1. Initialisation projet (starter) + CI/CD de base
2. Noyau Rust : SQLCipher + auth + encoding_rs + commandes CRUD
3. Schémas GEST en base + migrations
4. Frontend : routing + state management + import/parsing TS
5. Visualisation : arbre + fiches + panneaux + virtualisation
6. Édition : validation contrainte + workflow aperçu
7. Comparaison : moteur TS + dashboard + grille
8. Export : GEST (via Rust encoding_rs) + Excel
9. Sécurité : Isolation Pattern + capabilities + logging

**Dépendances Inter-Composants :**
- L'authentification (2) doit précéder tout accès BDD
- Les schémas GEST en base (3) sont requis par le parsing (4), la validation (6) et la comparaison (7)
- tauri-specta (2) génère les types utilisés par tout le frontend (4-8)
- La virtualisation (5) est requise par la visualisation et la comparaison

## Patterns d'Implémentation & Règles de Cohérence

### Conventions de Nommage

**Base de données SQLite :**
- Tables : `snake_case`, pluriel → `users`, `gest_files`, `card_schemas`, `card_fields`
- Colonnes : `snake_case` → `user_id`, `created_at`, `raw_line`
- Clés étrangères : `{table_singulier}_id` → `user_id`, `file_id`, `card_id`
- Index : `idx_{table}_{colonne}` → `idx_users_username`

**Code Rust (backend) :**
- Fonctions/variables : `snake_case` → `get_individu`, `import_file`
- Structs/Enums : `PascalCase` → `GestFile`, `CardType`, `ImportResult`
- Modules : `snake_case` → `commands/auth.rs`, `commands/gest.rs`
- Constantes : `SCREAMING_SNAKE_CASE` → `MAX_LINE_LENGTH`
- Commandes Tauri : `snake_case` → `#[tauri::command] fn get_carte(...)` (Tauri convertit automatiquement en `camelCase` côté JS)

**Code TypeScript (frontend) :**
- Variables/fonctions : `camelCase` → `getIndividu()`, `cardSchema`
- Types/Interfaces : `PascalCase` → `GestFile`, `CardField`, `ImportResult`
- Composants Svelte : `PascalCase` → `GestRawView.svelte`, `GestFieldEditor.svelte`
- Fichiers non-composants : `camelCase` → `gestParser.ts`, `validationUtils.ts`
- Stores : `camelCase` avec suffixe descriptif → `currentFileStore`, `authSessionStore`
- Constantes : `SCREAMING_SNAKE_CASE` → `MAX_LINE_LENGTH`

**Routes SvelteKit :**
- `kebab-case` → `/login`, `/importer`, `/explorer`, `/comparer`

### Patterns de Structure

**Tests :**
- Rust : tests unitaires dans le même fichier (`#[cfg(test)] mod tests`), tests d'intégration dans `src-tauri/tests/`
- TypeScript : co-localisés → `gestParser.ts` + `gestParser.test.ts` dans le même dossier
- Nommage : `*.test.ts` (TypeScript), `#[test]` inline (Rust)

**Organisation des composants :**
- Par feature/module, pas par type
- `src/lib/features/explorer/`, `src/lib/features/importer/`, `src/lib/features/comparer/`
- Composants partagés dans `src/lib/components/`
- Composants GEST custom dans `src/lib/components/gest/`

**Utilitaires et services :**
- Services (logique métier TS) : `src/lib/services/` → `gestParser.ts`, `gestValidator.ts`, `gestComparer.ts`
- Utilitaires (fonctions helper) : `src/lib/utils/` → `formatters.ts`, `encoding.ts`
- Types partagés : `src/lib/types/` → `gest.ts`, `auth.ts`, `compare.ts`
- Stores : `src/lib/stores/` → `fileStore.ts`, `authStore.ts`, `editorStore.ts`

### Patterns de Format

**Réponses des commandes Tauri (IPC) :**
- Retour typé via `Result<T, String>` côté Rust
- Côté TS : chaque commande retourne le type exact (via tauri-specta)
- Erreurs : chaîne descriptive côté Rust (`thiserror`), gestion par try/catch côté TS
- Pas de wrapper générique `{data, error}` — le typage fort suffit

**Format d'erreur utilisateur :**

```typescript
type AppError = {
  code: string;       // "IMPORT_INVALID_LENGTH", "AUTH_WRONG_PASSWORD"
  message: string;    // Message lisible en français
  field?: string;     // Champ concerné si applicable
  details?: unknown;  // Détails techniques optionnels
};
```

**Dates :**
- En base : ISO 8601 string (`2026-03-22T14:30:00Z`)
- En UI : format français (`22/03/2026 14:30`)

**JSON IPC :**
- `camelCase` pour les champs JSON (convention Tauri : serde renomme automatiquement `snake_case` Rust → `camelCase` JSON via `#[serde(rename_all = "camelCase")]`)

### Patterns de Communication

**Événements Tauri :**
- Nommage : `kebab-case` avec namespace → `file:imported`, `auth:logged-in`, `editor:field-changed`
- Payload : toujours un objet typé, jamais de primitif seul

**State Svelte :**
- État local composant : runes Svelte 5 (`$state`, `$derived`)
- État partagé : stores dans `src/lib/stores/`, exportés comme fonctions (`createFileStore()`)
- Mutations : jamais de mutation directe d'un store depuis un composant enfant — toujours via une fonction du store
- Pattern : chaque store expose des actions typées (`fileStore.setCurrentFile()`, pas `fileStore.update(...)`)

### Patterns de Processus

**Gestion d'erreurs :**
- Rust : `thiserror` pour les types d'erreur, propagation via `?`, jamais `unwrap()` en production
- TypeScript : try/catch autour de chaque `invoke()`, erreurs propagées via le store ou des toasts
- UI : jamais de modale bloquante pour les erreurs — toasts pour les erreurs passagères, panneau de validation navigable pour les erreurs persistantes
- Logging : erreurs techniques via `tauri-plugin-log`, erreurs utilisateur via le système de feedback UI

**États de chargement :**
- Convention : `isLoading` (booléen) pour les opérations simples
- Pour les opérations complexes : `status: 'idle' | 'loading' | 'success' | 'error'`
- Chaque commande Tauri longue (import, comparaison) : indicateur de progression dans la UI
- Pas d'état de chargement global — chaque module gère le sien

**Validation :**
- 3 états : `valid` (vert), `intermediate` (neutre), `invalid` (rouge)
- Timing : validation au blur pour les champs texte, validation immédiate pour les restrictions de caractères (Stop)
- Côté TS : la validation des schémas GEST se fait dans les services (`gestValidator.ts`), pas dans les composants

### Règles d'Application

**Tout agent IA DOIT :**
1. Respecter les conventions de nommage par couche (Rust snake_case, TS camelCase, composants PascalCase)
2. Co-localiser les tests avec le code source
3. Organiser par feature, pas par type
4. Utiliser `thiserror` + `?` en Rust, jamais `unwrap()`
5. Typer toutes les commandes Tauri via tauri-specta
6. Utiliser `#[serde(rename_all = "camelCase")]` sur toutes les structs exposées via IPC
7. Logger via `tauri-plugin-log`, jamais `println!` ou `console.log` en production
8. Encapsuler les données sensibles dans `SecretString`/`Zeroizing<T>` côté Rust

## Structure Projet & Frontières

### Structure Complète du Répertoire Projet

```
iris/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Build Windows + cargo test + vitest + cargo audit + cargo deny
│       └── security.yml                    # cargo audit + cargo deny + cargo geiger
├── .vscode/
│   └── settings.json                       # Config éditeur partagée
├── src/                                    # ── FRONTEND (SvelteKit) ──
│   ├── app.css                             # Tailwind directives + tokens custom IRIS
│   ├── app.html                            # Shell HTML SvelteKit
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                         # Composants shadcn-svelte (copiés par CLI)
│   │   │   ├── gest/                       # Composants métier IRIS custom
│   │   │   │   ├── GestRawView.svelte              # Vue brute 204 car. segmentée colorée
│   │   │   │   ├── GestRawView.test.ts
│   │   │   │   ├── GestFieldEditor.svelte           # Édition contrainte par plage
│   │   │   │   ├── GestFieldEditor.test.ts
│   │   │   │   ├── GestHierarchyTree.svelte         # Arbre navigation 5 niveaux
│   │   │   │   ├── GestHierarchyTree.test.ts
│   │   │   │   ├── GestFicheSynthetique.svelte      # Fiches Fichier/Individu/Dossier
│   │   │   │   ├── GestFicheSynthetique.test.ts
│   │   │   │   ├── GestCompareGrid.svelte           # Grille comparaison champ par champ
│   │   │   │   ├── GestCompareGrid.test.ts
│   │   │   │   ├── GestCompareDashboard.svelte      # Dashboard statistique comparaison
│   │   │   │   ├── GestCompareDashboard.test.ts
│   │   │   │   ├── GestValidationPanel.svelte       # Panneau erreurs navigable
│   │   │   │   ├── GestValidationPanel.test.ts
│   │   │   │   ├── GestChangeTracker.svelte         # Suivi modifications pendantes + aperçu avant enregistrement
│   │   │   │   └── GestChangeTracker.test.ts
│   │   │   └── layout/                     # Composants de layout partagés
│   │   │       ├── AppSidebar.svelte
│   │   │       ├── AppBreadcrumbs.svelte
│   │   │       └── AppToolbar.svelte
│   │   ├── features/
│   │   │   ├── importer/                   # Module Importer
│   │   │   │   ├── ImportDropZone.svelte
│   │   │   │   ├── ImportHistory.svelte
│   │   │   │   ├── ValidationReport.svelte
│   │   │   │   └── importerUtils.ts
│   │   │   ├── explorer/                   # Module Explorer
│   │   │   │   ├── ExplorerView.svelte
│   │   │   │   ├── CardDetailPanel.svelte
│   │   │   │   ├── EditorToggle.svelte
│   │   │   │   ├── ChangePreview.svelte
│   │   │   │   └── explorerUtils.ts
│   │   │   ├── comparer/                   # Module Comparer
│   │   │   │   ├── CompareSetup.svelte
│   │   │   │   ├── CompareResults.svelte
│   │   │   │   ├── DiffNavigator.svelte
│   │   │   │   └── comparerUtils.ts
│   │   │   └── auth/                       # Module Authentification
│   │   │       ├── LoginForm.svelte
│   │   │       ├── RegisterForm.svelte
│   │   │       └── authUtils.ts
│   │   ├── services/                       # Logique métier TypeScript
│   │   │   ├── gestParser.ts               # Parsing positionnel des lignes GEST
│   │   │   ├── gestParser.test.ts
│   │   │   ├── gestValidator.ts            # Validation schéma 31 types de cartes
│   │   │   ├── gestValidator.test.ts
│   │   │   ├── gestComparer.ts             # Moteur de comparaison multi-fichiers
│   │   │   ├── gestComparer.test.ts
│   │   │   ├── gestReconstructor.ts        # Reconstruction lignes brutes après édition
│   │   │   ├── gestReconstructor.test.ts
│   │   │   └── tauriCommands.ts            # Wrapper typé des invoke() (généré par tauri-specta)
│   │   ├── stores/                         # Stores Svelte partagés
│   │   │   ├── authStore.ts                # Session utilisateur
│   │   │   ├── fileStore.ts                # Fichier courant, données parsées
│   │   │   ├── editorStore.ts              # Mode édition, modifications pendantes
│   │   │   └── compareStore.ts             # État de comparaison
│   │   ├── types/                          # Types TypeScript partagés
│   │   │   ├── gest.ts                     # GestFile, Card, Field, CardSchema...
│   │   │   ├── auth.ts                     # User, Session, AuthError...
│   │   │   ├── compare.ts                  # Difference, CompareResult, CompareStats...
│   │   │   └── errors.ts                   # AppError, ValidationError...
│   │   └── utils/                          # Utilitaires génériques
│   │       ├── formatters.ts               # Formatage dates, montants, labels FR
│   │       └── constants.ts                # MAX_LINE_LENGTH, constantes partagées
│   └── routes/                             # Routes SvelteKit
│       ├── +layout.svelte                  # Layout racine (sidebar L1, auth guard)
│       ├── +layout.ts                      # Load function racine
│       ├── login/
│       │   └── +page.svelte
│       ├── importer/
│       │   ├── +layout.svelte
│       │   └── +page.svelte
│       ├── explorer/
│       │   ├── +layout.svelte
│       │   └── +page.svelte
│       └── comparer/
│           ├── +layout.svelte
│           └── +page.svelte
├── src-tauri/                              # ── BACKEND RUST (Tauri) ──
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── tauri.conf.json                     # Isolation Pattern, CSP, capabilities
│   ├── capabilities/
│   │   └── main-window.json                # Permissions par fenêtre
│   ├── icons/
│   ├── src/
│   │   ├── main.rs                         # Point d'entrée, enregistrement commandes + plugins
│   │   ├── lib.rs
│   │   ├── commands/                       # Commandes Tauri (IPC)
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs                     # create_user, login, logout, verify_session
│   │   │   ├── gest.rs                     # get_file, get_individus, get_carte, update_champ, get_schemas
│   │   │   ├── file.rs                     # import_file (Win-1252), export_file (ré-encodage)
│   │   │   └── compare.rs                  # save_compare_result, export_compare_excel
│   │   ├── db/                             # Couche accès données
│   │   │   ├── mod.rs
│   │   │   ├── connection.rs               # SQLCipher, dérivation clé Argon2id
│   │   │   ├── migrations.rs               # Migrations via refinery/rusqlite_migration
│   │   │   ├── users.rs
│   │   │   ├── files.rs
│   │   │   └── schemas.rs
│   │   ├── security/                       # Couche sécurité
│   │   │   ├── mod.rs
│   │   │   ├── crypto.rs                   # Argon2id, dérivation clé DB
│   │   │   ├── keyring.rs                  # Keyring OS, key wrapping KEK
│   │   │   └── session.rs                  # Gestion session, state Tauri
│   │   ├── encoding/                       # Gestion encodage
│   │   │   ├── mod.rs
│   │   │   └── windows1252.rs              # Décodage/ré-encodage via encoding_rs
│   │   └── errors.rs                       # Types d'erreur (thiserror)
│   ├── migrations/                         # Fichiers SQL de migration
│   │   ├── V001__create_users.sql
│   │   ├── V002__create_gest_files.sql
│   │   ├── V003__create_card_schemas.sql
│   │   └── V004__create_lines_and_fields.sql
│   └── tests/                              # Tests d'intégration Rust
│       ├── db_tests.rs
│       └── command_tests.rs
├── dist-isolation/                         # Iframe Isolation Pattern Tauri
│   └── index.html
├── static/                                 # Assets statiques SvelteKit
│   └── fonts/
│       ├── Inter.woff2
│       └── JetBrainsMono.woff2
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json                         # Config shadcn-svelte
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── CLAUDE.md                               # Guidelines pour agents IA
```

### Frontières Architecturales

**Frontière IPC (Rust ↔ TypeScript) :**
- Le frontend ne touche JAMAIS la base de données directement
- Toutes les données passent par des commandes Tauri typées (tauri-specta)
- Les données sensibles ne traversent jamais la frontière IPC en clair
- Direction : TS `invoke()` → Rust commande → Rust DB → Rust réponse → TS

**Frontière Sécurité :**
- Chiffrement, secrets et mémoire sensible = côté Rust exclusivement
- Le frontend reçoit des données déjà déchiffrées et décodées
- Les tokens de session restent dans `tauri::State`, jamais exposés au WebView

**Frontière Logique Métier :**
- Services TS (`src/lib/services/`) = parsing, validation, comparaison (données en mémoire)
- Commandes Rust (`src-tauri/src/commands/`) = I/O, persistance, sécurité
- Les services TS ne font jamais d'I/O fichier ni d'accès BDD

**Frontière UI :**
- Composants GEST custom (`src/lib/components/gest/`) = affichage métier
- Composants shadcn (`src/lib/components/ui/`) = briques de base, jamais modifiés
- Features (`src/lib/features/`) = orchestration composants + appels services/stores

### Mapping Exigences → Structure

| Domaine FR | Frontend | Backend Rust |
|------------|----------|-------------|
| **Auth (FR1-FR4)** | `features/auth/`, `stores/authStore.ts` | `commands/auth.rs`, `security/`, `db/users.rs` |
| **Import (FR5-FR12)** | `features/importer/`, `services/gestParser.ts` | `commands/file.rs`, `encoding/windows1252.rs` |
| **Visualisation (FR13-FR18)** | `features/explorer/`, `components/gest/`, `stores/fileStore.ts` | `commands/gest.rs`, `db/files.rs` |
| **Modification (FR19-FR23)** | `features/explorer/`, `services/gestValidator.ts`, `stores/editorStore.ts` | `commands/gest.rs` |
| **Comparaison (FR24-FR33)** | `features/comparer/`, `services/gestComparer.ts`, `stores/compareStore.ts` | `commands/compare.rs` |
| **Export (FR34-FR38)** | `features/explorer/` + `features/comparer/` | `commands/file.rs`, `encoding/windows1252.rs` |
| **Persistance (FR39-FR43)** | — | `db/`, `security/`, `commands/` |

### Flux de Données Principal

```
Fichier GEST (.gest)
    │
    ▼  [Rust] commands/file.rs::import_file
    │  Lecture fichier + décodage Win-1252 (encoding_rs)
    │  Stockage lignes brutes en BDD (SQLCipher)
    │
    ▼  [TS] services/gestParser.ts
    │  Parsing positionnel → cartes structurées
    │  Validation schéma (gestValidator.ts)
    │
    ▼  [Svelte] features/explorer/ + components/gest/
    │  Affichage fiches, panneaux, arbre, vue brute
    │  Édition contrainte (GestFieldEditor)
    │
    ▼  [TS] services/gestReconstructor.ts
    │  Reconstruction ligne 204 car. modifiée
    │
    ▼  [Rust] commands/file.rs::export_file
       Ré-encodage Win-1252 + écriture fichier
```

## Résultats de Validation de l'Architecture

### Validation de Cohérence ✅

**Compatibilité des décisions :**
Toutes les versions technologiques sont compatibles et actuelles (mars 2026). Tauri v2.10.3 + SvelteKit 2.55 + Svelte 5 + Tailwind v4.2 + shadcn-svelte 1.0.9 forment un ensemble cohérent. rusqlite 0.38.0 + bundled-sqlcipher-vendored-openssl compile en standalone. L'approche hybride TS-first + Rust ciblé est cohérente avec les commandes Tauri fines et tauri-specta. Aucune contradiction détectée.

**Cohérence des patterns :**
Le nommage Rust snake_case → auto-converti en camelCase JSON via serde → cohérent avec le nommage TS camelCase. Tests co-localisés (TS) + inline (Rust) cohérents avec l'organisation par feature. Stores Svelte contextuels cohérents avec le routing SvelteKit par module.

**Alignement structure :**
La structure projet reflète exactement les frontières définies (IPC, sécurité, logique métier, UI). Chaque domaine FR a son emplacement clairement identifié côté frontend ET backend.

### Validation de Couverture des Exigences ✅

**Couverture Fonctionnelle : 44/44 FR (100%)**

| Domaine | FR | Support architectural |
|---------|----|-----------------------|
| Auth | FR1-FR4 | `commands/auth.rs` + `security/` + `features/auth/` |
| Import | FR5-FR12 | `commands/file.rs` + `encoding/` + `gestParser.ts` + `gestValidator.ts` |
| Gestion bandes | FR44 | `commands/gest.rs` (CASCADE DELETE) + `features/importer/` |
| Visualisation | FR13-FR18 | `components/gest/` + `features/explorer/` + `stores/fileStore.ts` |
| Modification | FR19-FR23 | `GestFieldEditor` + `gestValidator.ts` + `gestReconstructor.ts` + `editorStore.ts` |
| Comparaison | FR24-FR33 | `gestComparer.ts` + `GestCompareGrid` + `GestCompareDashboard` + `features/comparer/` |
| Export | FR34-FR38 | `commands/file.rs::export_file` + `commands/compare.rs::export_compare_excel` |
| Persistance | FR39-FR43 | `db/` (SQLCipher) + `security/` (Argon2id, keyring, zeroize) |

**Couverture Non-Fonctionnelle : 15/15 NFR (100%)**

| Domaine | NFR | Support architectural |
|---------|-----|-----------------------|
| Performance | NFR1-NFR6 | Logique métier TS (pas d'overhead IPC), virtualisation listes, Rust pour I/O |
| Sécurité | NFR7-NFR12 | SQLCipher + Argon2id + keyring + zeroize/secrecy + Isolation Pattern + user_id + tauri-plugin-log |
| Accessibilité | NFR13-NFR15 | Composants GEST avec aria-* + double encodage couleur+symbole + navigation clavier |

### Validation de Prêt-à-Implémenter ✅

**Complétude des décisions :** Toutes les décisions critiques documentées avec versions vérifiées et rationale explicite.
**Complétude de la structure :** Arborescence complète (~80 fichiers/dossiers), rôle de chaque fichier documenté.
**Complétude des patterns :** Nommage, structure, communication et processus couverts avec exemples.

### Analyse de Gaps

**Gaps critiques : Aucun**

**Gaps importants (non bloquants, à résoudre à l'implémentation) :**
1. Schéma BDD détaillé (colonnes exactes) — à affiner dans les stories
2. Crate Rust pour export Excel (ex: rust_xlsxwriter) — à choisir à l'implémentation
3. Librairie de virtualisation Svelte — à évaluer à l'implémentation

**Gaps nice-to-have :**
- Contenu du fichier CLAUDE.md — à rédiger lors de l'initialisation projet

### Checklist de Complétude de l'Architecture

**✅ Analyse des Exigences**
- [x] Contexte projet analysé en profondeur
- [x] Échelle et complexité évaluées (Élevée)
- [x] Contraintes techniques identifiées (Win-1252, format 204 car., Windows, RGPD)
- [x] Préoccupations transversales mappées (6 identifiées)

**✅ Décisions Architecturales**
- [x] Décisions critiques documentées avec versions vérifiées
- [x] Stack technologique complètement spécifiée
- [x] Patterns d'intégration définis (IPC Tauri fines + tauri-specta)
- [x] Considérations de performance adressées (hybride TS/Rust)

**✅ Patterns d'Implémentation**
- [x] Conventions de nommage établies (BDD, Rust, TS, routes)
- [x] Patterns de structure définis (par feature, tests co-localisés)
- [x] Patterns de communication spécifiés (événements Tauri, stores Svelte)
- [x] Patterns de processus documentés (erreurs, loading, validation)

**✅ Structure Projet**
- [x] Arborescence complète définie
- [x] Frontières des composants établies
- [x] Points d'intégration mappés
- [x] Mapping exigences → structure complet

### Évaluation de Prêt

**Statut global : PRÊT POUR L'IMPLÉMENTATION**

**Niveau de confiance : Élevé**

**Points forts :**
- Architecture sécurité exhaustive validée par un document de recherche dédié
- Décision hybride TS/Rust fondée sur des benchmarks et retours d'expérience concrets
- Structure projet complète avec mapping 1:1 vers les exigences
- Couverture 100% des FR et NFR

**Axes d'amélioration future :**
- Schéma BDD détaillé (colonnes) — à affiner lors des stories
- Choix du crate Excel et de la librairie de virtualisation — à l'implémentation
- Contenu CLAUDE.md — à rédiger lors de l'initialisation projet

### Consignes pour les Agents IA

- Suivre toutes les décisions architecturales exactement comme documentées
- Utiliser les patterns d'implémentation de manière cohérente sur tous les composants
- Respecter la structure projet et les frontières définies
- Se référer à ce document pour toute question architecturale

**Première priorité d'implémentation :** Initialisation du projet via le starter officiel composé (sv create + tauri init + shadcn-svelte init)
