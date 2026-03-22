# Epic 1 : Fondations Projet & Authentification Sécurisée

L'utilisateur peut créer un compte, s'authentifier et accéder à un espace de données sécurisé et cloisonné. Les fondations techniques (starter, CI/CD, BDD chiffrée, stack sécurité) sont en place pour supporter toutes les épiques suivantes.

## Story 1.1 : Initialisation du projet avec le starter officiel composé

As a développeur,
I want initialiser le projet IRIS avec la stack officielle (SvelteKit + Tauri + shadcn-svelte),
So that j'ai un squelette fonctionnel prêt pour le développement avec les conventions et la structure de dossiers définies par l'architecture.

**Acceptance Criteria:**

**Given** aucun projet n'existe encore
**When** les commandes d'initialisation sont exécutées (`sv create iris`, `npm install -D @sveltejs/adapter-static`, `npx tauri init`, `npx shadcn-svelte@latest init`)
**Then** le projet compile et démarre en mode développement (frontend + backend Tauri)
**And** TypeScript strict est activé
**And** Tailwind CSS v4 est configuré avec le plugin Vite natif
**And** adapter-static est configuré pour le mode SPA
**And** Vitest est configuré et un test placeholder passe
**And** ESLint + Prettier sont configurés

**Given** le projet est initialisé
**When** je vérifie la structure de dossiers
**Then** les dossiers suivants existent : `src/lib/components/ui/`, `src/lib/components/gest/`, `src/lib/components/layout/`, `src/lib/features/auth/`, `src/lib/features/importer/`, `src/lib/features/explorer/`, `src/lib/features/comparer/`, `src/lib/services/`, `src/lib/stores/`, `src/lib/types/`, `src/lib/utils/`, `src/routes/login/`, `src/routes/importer/`, `src/routes/explorer/`, `src/routes/comparer/`, `src-tauri/src/commands/`, `src-tauri/src/db/`, `src-tauri/src/security/`, `src-tauri/src/encoding/`, `src-tauri/migrations/`

**Given** le projet est initialisé
**When** je vérifie les tokens de design
**Then** `src/app.css` contient les tokens IRIS : palette de couleurs (--bg-primary à --accent), couleurs sémantiques (--valid, --intermediate, --invalid, --info), couleurs de comparaison (--diff-added, --diff-removed, --diff-modified), système typographique (Inter + JetBrains Mono, échelle 11px-24px), système d'espacement (--space-1 4px à --space-8 32px)
**And** les polices Inter et JetBrains Mono sont intégrées dans `static/fonts/`

**Given** le projet est initialisé
**When** je vérifie la configuration Tauri
**Then** `tauri.conf.json` est configuré avec le mode Isolation Pattern
**And** `dist-isolation/index.html` existe
**And** le fichier `capabilities/main-window.json` existe
**And** `CLAUDE.md` existe à la racine avec les guidelines de développement issues de l'architecture

## Story 1.2 : Pipeline CI/CD GitHub Actions

As a développeur,
I want un pipeline CI/CD automatisé,
So that chaque push est validé automatiquement (build, tests, audit sécurité) et les régressions sont détectées immédiatement.

**Acceptance Criteria:**

**Given** le code est poussé sur une branche ou une pull request est ouverte
**When** le pipeline CI se déclenche
**Then** le build Windows (Tauri) réussit
**And** `cargo test` exécute les tests Rust et passe
**And** `vitest run` exécute les tests TypeScript et passe
**And** `cargo audit` vérifie l'absence de vulnérabilités connues dans les dépendances Rust
**And** `cargo deny check` vérifie les licences et les advisories

**Given** le pipeline CI est configuré
**When** je consulte `.github/workflows/ci.yml`
**Then** le workflow cible `ubuntu-latest` ou `windows-latest` selon la matrice
**And** les étapes sont clairement nommées et documentées

## Story 1.3 : Base de données SQLite chiffrée et gestion des secrets

As a utilisateur,
I want que mes données soient chiffrées au repos dans une base de données locale,
So that personne ne puisse accéder à mes données sensibles de paie en inspectant le fichier de base de données sur le disque.

**Acceptance Criteria:**

**Given** l'application démarre pour la première fois
**When** le système initialise la base de données
**Then** une base de données SQLite chiffrée via SQLCipher est créée (rusqlite + bundled-sqlcipher-vendored-openssl)
**And** une KEK (Key Encryption Key) aléatoire est générée et stockée dans le keyring OS (DPAPI sur Windows)
**And** la clé de chiffrement BDD est wrappée avec la KEK via aes-gcm et stockée sur disque
**And** la table `users` est créée via le système de migrations versionnées

**Given** la base de données existe sur le disque
**When** un utilisateur tente d'ouvrir le fichier SQLite avec un outil externe (DB Browser, sqlite3)
**Then** les données sont illisibles — le fichier est chiffré (FR40, FR41)

**Given** l'application est en cours d'exécution
**When** le système accède à la base de données
**Then** la clé de chiffrement est dérivée de la KEK du keyring OS
**And** les données sensibles en mémoire (clé, KEK) sont encapsulées dans `Zeroizing<T>` / `SecretString` (zeroize + secrecy)

**Given** le système de migrations existe
**When** une nouvelle migration est ajoutée
**Then** elle est appliquée automatiquement au démarrage de l'application
**And** les migrations sont versionnées et reproductibles (refinery ou rusqlite_migration)

**Given** les commandes Tauri sont exposées
**When** le frontend invoque une commande d'accès BDD
**Then** la commande est typée via tauri-specta et les bindings TypeScript sont générés automatiquement

## Story 1.4 : Inscription et création de compte utilisateur

As a nouvel utilisateur (Amélie),
I want créer un compte avec un nom d'utilisateur et un mot de passe,
So that je puisse accéder à l'application et que mes données soient associées à mon compte de manière sécurisée.

**Acceptance Criteria:**

**Given** l'application est lancée et aucun utilisateur n'est connecté
**When** l'utilisateur accède à l'écran de connexion
**Then** un lien/bouton "Créer un compte" est visible et accessible

**Given** l'utilisateur est sur l'écran de création de compte
**When** il saisit un nom d'utilisateur et un mot de passe valides et soumet le formulaire
**Then** le mot de passe est hashé avec Argon2id (FR1, NFR9)
**And** l'utilisateur est créé en base de données avec un `user_id` unique (FR42)
**And** l'utilisateur est automatiquement connecté après inscription
**And** un toast de succès confirme la création du compte

**Given** l'utilisateur tente de créer un compte
**When** le nom d'utilisateur est déjà pris
**Then** un message d'erreur inline clair est affiché (pas de modale bloquante)
**And** le formulaire reste rempli (pas de perte de saisie)

**Given** l'utilisateur tente de créer un compte
**When** le mot de passe est trop court ou ne respecte pas les critères minimaux
**Then** la validation affiche l'état Invalid avec un message descriptif sous le champ
**And** l'état Intermediate est utilisé pendant la saisie (pas de validation prématurée)

**Given** l'écran de création de compte est affiché
**When** je vérifie l'accessibilité
**Then** tous les champs ont des labels associés (NFR13)
**And** les éléments sont accessibles au clavier (NFR14)
**And** le contraste des textes est suffisant (NFR15)

## Story 1.5 : Connexion, session sécurisée et déconnexion

As a utilisateur authentifié,
I want me connecter avec mes identifiants, accéder uniquement à mes données, et me déconnecter en toute sécurité,
So that mes données de paie sensibles sont protégées et cloisonnées des autres utilisateurs.

**Acceptance Criteria:**

**Given** l'utilisateur est sur l'écran de connexion
**When** il saisit un nom d'utilisateur et un mot de passe corrects et soumet le formulaire
**Then** le mot de passe est vérifié contre le hash Argon2id stocké (FR2)
**And** une session est créée dans `tauri::State`
**And** l'utilisateur est redirigé vers le module Importer (page d'accueil)

**Given** l'utilisateur tente de se connecter
**When** les identifiants sont incorrects
**Then** un message d'erreur générique est affiché ("Identifiants incorrects" — sans révéler si c'est le nom d'utilisateur ou le mot de passe)
**And** le formulaire reste accessible pour une nouvelle tentative

**Given** l'utilisateur est connecté
**When** il navigue dans l'application
**Then** toutes les requêtes BDD sont filtrées par son `user_id` (FR3, NFR11)
**And** il ne peut en aucun cas accéder aux données d'un autre utilisateur

**Given** l'utilisateur n'est pas connecté
**When** il tente d'accéder à une route protégée (/importer, /explorer, /comparer)
**Then** il est redirigé vers l'écran de connexion (auth guard sur le layout racine)

**Given** l'utilisateur est connecté
**When** il clique sur le bouton de déconnexion
**Then** la session est détruite (FR4)
**And** les données sensibles en mémoire sont nettoyées via zeroize (FR43, NFR10)
**And** l'utilisateur est redirigé vers l'écran de connexion

**Given** l'application est fermée (croix, Alt+F4)
**When** le processus se termine
**Then** les données sensibles en mémoire sont nettoyées via zeroize (FR43, NFR10)
**And** les tokens de session sont invalidés

**Given** la CSP est configurée
**When** je vérifie la configuration Tauri
**Then** l'Isolation Pattern est actif avec `freezePrototype`
**And** la CSP est stricte (pas d'eval, pas d'inline scripts non sécurisés)
