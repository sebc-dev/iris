# Requirements Inventory

## Functional Requirements

**Gestion des Utilisateurs**
- FR1: L'utilisateur peut créer un compte avec des identifiants locaux
- FR2: L'utilisateur peut s'authentifier pour accéder à l'application
- FR3: L'utilisateur peut uniquement accéder à ses propres données (cloisonnement)
- FR4: L'utilisateur peut se déconnecter de l'application

**Import & Analyse de Fichiers GEST**
- FR5: L'utilisateur peut importer un fichier GEST depuis le système de fichiers via une boîte de dialogue
- FR6: L'utilisateur peut importer un fichier GEST par glisser-déposer dans l'application
- FR7: Le système valide chaque ligne importée sur sa longueur (204 caractères)
- FR8: Le système valide l'encodage du fichier importé (Windows-1252)
- FR9: Le système valide chaque ligne contre le schéma spécifique de son type de carte (positions, formats, valeurs)
- FR10: L'utilisateur peut consulter un rapport de validation après import (lignes OK, lignes KO, détail des erreurs)
- FR11: Le système décode l'en-tête de bande GEST (code correspondance, date de paye, chaîne, ministère, administration, département)
- FR12: Le système identifie et classe les cartes par type parmi les 31 types supportés

**Gestion des Bandes GEST Importées**
- FR44: L'utilisateur peut supprimer une bande GEST importée, ce qui supprime définitivement toutes les données associées (lignes brutes, champs décodés, résultats de comparaison) de la base de données

**Visualisation des Bandes GEST**
- FR13: L'utilisateur peut visualiser l'en-tête de bande décodé avec les métadonnées lisibles
- FR14: L'utilisateur peut visualiser la liste des cartes avec leurs champs décodés et libellés
- FR15: L'utilisateur peut naviguer par individu (INSEE/NUDOS)
- FR16: L'utilisateur peut naviguer par type de carte
- FR17: L'utilisateur peut filtrer l'affichage par type de carte
- FR18: L'utilisateur peut consulter le détail d'une carte avec tous ses champs positionnels décodés

**Modification de Fichiers GEST**
- FR19: L'utilisateur peut modifier la valeur d'un champ d'une carte via un formulaire d'édition
- FR20: Le système valide en temps réel la modification contre le schéma du type de carte (format, longueur, valeurs autorisées)
- FR21: Le système empêche la saisie de valeurs non conformes au schéma
- FR22: Le système maintient l'intégrité de la ligne à 204 caractères après modification
- FR23: Le système reconstruit la ligne brute à partir des champs modifiés

**Comparaison de Fichiers GEST**
- FR24: L'utilisateur peut sélectionner un fichier GEST de référence et un ou plusieurs fichiers GEST cibles pour comparaison
- FR25: Le système apparie les cartes entre référence et cibles selon les clés d'appariement spécifiques à chaque type de carte
- FR26: Le système détecte les écarts de valeur champ par champ entre cartes appariées
- FR27: Le système identifie les cartes orphelines (présentes en référence mais absentes en comparaison, et inversement)
- FR28: Le système identifie les doublons (correspondances multiples)
- FR29: Le système identifie les cartes dont l'appariement automatique est impossible (types de cartes dont la combinaison de champs ne permet pas une correspondance unique)
- FR30: L'utilisateur peut apparier manuellement des cartes lorsque l'appariement automatique n'est pas possible
- FR31: L'utilisateur peut exclure des types de cartes de la comparaison, auquel cas ces cartes sont ignorées et ne génèrent ni différence ni orphelin
- FR32: L'utilisateur peut visualiser les résultats de comparaison avec les différences détaillées (champ, valeur référence, valeur comparaison)
- FR33: L'utilisateur peut consulter les métriques de comparaison (cartes appariées, cartes avec différences, cartes orphelines)

**Export**
- FR34: L'utilisateur peut exporter un fichier GEST modifié dans son format d'origine (largeur fixe 204 caractères, encodage Windows-1252)
- FR35: Le système exécute une validation complète avant export (longueur, encodage, schéma par type de carte)
- FR36: L'utilisateur peut consulter un rapport de validation avant export
- FR37: L'utilisateur peut exporter les résultats de comparaison en format Excel
- FR38: L'utilisateur peut choisir l'emplacement de sauvegarde via une boîte de dialogue native

**Persistance & Sécurité des Données**
- FR39: Le système stocke les données importées dans une base de données SQLite locale
- FR40: Le système chiffre toutes les données en base de données au repos
- FR41: Les données en base ne sont pas accessibles en clair lorsque l'application est fermée
- FR42: Le système associe chaque donnée stockée à l'utilisateur authentifié
- FR43: Le système nettoie les données sensibles en mémoire à la fermeture de l'application

## NonFunctional Requirements

**Performance**
- NFR1: L'import et le parsing d'un fichier GEST de 10 000 lignes s'effectue en moins de 5 secondes
- NFR2: L'affichage structuré des cartes après import est instantané (< 500ms)
- NFR3: La navigation entre individus et types de cartes est fluide (< 200ms)
- NFR4: La comparaison de deux fichiers GEST de 10 000 lignes s'effectue en moins de 10 secondes
- NFR5: La validation en temps réel lors de l'édition d'un champ est imperceptible (< 100ms)
- NFR6: L'export d'un fichier GEST modifié s'effectue en moins de 3 secondes

**Sécurité**
- NFR7: Toutes les données en base SQLite sont chiffrées au repos via un mécanisme de chiffrement transparent
- NFR8: Aucune donnée sensible n'est accessible en clair sur le disque lorsque l'application est fermée
- NFR9: Les mots de passe utilisateur sont hashés (jamais stockés en clair)
- NFR10: Les données sensibles en mémoire sont nettoyées à la fermeture de l'application
- NFR11: Cloisonnement strict : un utilisateur ne peut en aucun cas accéder aux données d'un autre utilisateur
- NFR12: Conformité RGPD : aucune donnée personnelle (INSEE, RIB, données de paie) n'est stockée en clair, transmise à un tiers, ou accessible sans authentification préalable

**Accessibilité**
- NFR13: L'interface respecte le niveau minimum WCAG 2.1 A (contraste, navigation clavier, labels)
- NFR14: Les éléments interactifs sont accessibles au clavier
- NFR15: Les libellés et textes sont lisibles avec un contraste suffisant

## Additional Requirements

**Starter Template & Initialisation Projet**
- L'architecture spécifie un starter officiel composé : `sv create` → `tauri init` → `shadcn-svelte init`. Ceci constitue la première story d'implémentation (Epic 1, Story 1).
- Stack : SvelteKit + TypeScript strict + Svelte 5 + Tailwind CSS v4 + Tauri v2 + shadcn-svelte + Vitest

**Infrastructure & CI/CD**
- Pipeline GitHub Actions : build Windows + cargo test + vitest + cargo audit + cargo deny
- Pipeline sécurité : cargo audit + cargo deny + cargo geiger
- Distribution : installeur NSIS/MSI via Tauri bundler

**Architecture des Données**
- Modèle de stockage hybride : ligne brute (204 car.) + champs décodés en colonnes
- Schémas des 31 types de cartes GEST stockés en base SQLite (configurables)
- Cloisonnement par user_id dans une base unique chiffrée
- Migrations BDD versionnées via un crate Rust dédié (refinery ou rusqlite_migration)

**Authentification & Sécurité (Stack technique)**
- Hashing : Argon2id (argon2 v0.5.3)
- Chiffrement BDD : rusqlite + bundled-sqlcipher-vendored-openssl
- Secrets OS : keyring v3.6.3 (DPAPI/Keychain/Secret Service)
- Key wrapping : KEK aléatoire dans keychain + clé wrappée sur disque (aes-gcm)
- Protection mémoire : zeroize v1.8.2 + secrecy v0.10
- IPC : Isolation Pattern + CSP strict + freezePrototype

**Communication Frontend ↔ Backend**
- Approche hybride progressive : TypeScript-first + noyau Rust ciblé
- Rust obligatoire : SQLCipher, encodage Windows-1252 (encoding_rs), keyring/secrets, zeroize/secrecy, requêtes BDD
- TypeScript : parsing positionnel, validation schéma, édition champs, comparaison, reconstruction lignes, state UI
- Commandes Tauri fines (~15-25 au MVP), une par opération
- Génération de types via tauri-specta v2.0.0-rc (type-safety end-to-end Rust↔TS)

**Architecture Frontend**
- State management : Svelte 5 runes + stores contextuels
- Routing SvelteKit classique : /login, /importer, /explorer, /comparer
- Virtualisation des listes longues (10 000+ lignes)

**Logging**
- tauri-plugin-log v2.8.0 : bridge unifié Rust + JavaScript

**Patterns d'Implémentation**
- Organisation par feature (pas par type)
- Tests co-localisés (TS) + inline (Rust)
- Erreurs via thiserror (Rust) + toasts/panneau navigable (UI)
- Validation 3 états : valid / intermediate / invalid
- Données sensibles encapsulées dans SecretString/Zeroizing<T> côté Rust

## UX Design Requirements

**Design System & Tokens**
- UX-DR1: Implémenter la palette de couleurs IRIS complète : tokens neutres froids (--bg-primary à --border, --accent), couleurs sémantiques (--valid, --intermediate, --invalid, --info), couleurs de comparaison diff (--diff-added, --diff-removed, --diff-modified avec symboles +/−/~), et palette de 8 teintes pastel alternées pour la segmentation vue brute
- UX-DR2: Implémenter le système typographique à double police : Inter (sans-serif) pour l'interface, JetBrains Mono (monospace) pour la vue brute et données positionnelles. Échelle typographique base 14px avec 6 niveaux (--text-xs 11px à --text-2xl 24px)
- UX-DR3: Implémenter le système d'espacement basé sur une unité de 4px (--space-1 à --space-8) avec densité compacte par défaut pour les grilles et tableaux
- UX-DR4: Implémenter le chrome de couleur par contexte fichier : Production (rouge discret), Recette (orange discret), Test (vert discret)

**Composants Custom IRIS**
- UX-DR5: Développer `GestRawView` — Vue brute 204 caractères avec segmentation colorée par champ (palette 8 teintes pastel alternées), infobulle au survol (nom, type, positions, valeur décodée), synchronisation bidirectionnelle avec le panneau détail, police JetBrains Mono, affichage sur une seule ligne
- UX-DR6: Développer `GestFieldEditor` — Édition contrainte par plage avec validation 3 états (Acceptable/Intermediate/Invalid), masque positionnel, restriction de caractères par type, compteur de progression, 3 niveaux de sévérité (Stop/Warning/Info), label permanent (nom, type, positions)
- UX-DR7: Développer `GestHierarchyTree` — Arbre de navigation 4 niveaux (Fichier → Individu → Dossier → Carte) avec icônes différenciées, badges compteur d'enfants, champ de recherche avec filtre temps réel, synchronisation bidirectionnelle, navigation clavier (flèches, Enter, Home/End)
- UX-DR8: Développer `GestFicheSynthetique` — 3 variantes contextuelles : Fichier (en-tête de bande décodé + métriques + liste individus cliquables), Individu (INSEE + dossiers + résumé), Dossier (NUDOS + liste cartes avec aperçu champs). Cartes stat avec bordure colorée, items cliquables avec flèche →
- UX-DR9: Développer `GestCompareGrid` — Grille de comparaison champ par champ avec colonnes (indicateur +/−/~, INSEE, NUDOS, Individu, Type carte, Champ, Valeur référence, Valeur comparaison), coloration par type de diff, navigation ◀ ▶ avec compteur, chips de filtre par type de changement et type de carte
- UX-DR10: Développer `GestCompareDashboard` — Dashboard statistique de comparaison avec cartes cliquables (identiques/modifiées/absentes/nouvelles), drill-down par catégorie vers la grille, bouton export Excel
- UX-DR11: Développer `GestValidationPanel` — 2 variantes : import (rapport post-import avec métriques lignes OK/KO + liste d'erreurs navigable) et export (liste d'erreurs restantes style MessagePopover SAP Fiori). Clic sur une erreur → navigation vers la ligne/champ concerné
- UX-DR12: Développer `GestChangeTracker` — Mode compact (badge compteur modifications dans toolbar) + mode aperçu (Dialog/Sheet avec ancien → nouveau surlignage style code review), boutons "Enregistrer" / "Annuler tout"

**Architecture de Navigation**
- UX-DR13: Implémenter la sidebar multi-niveaux : Niveau 1 = barre d'icônes 48px (Importer, Explorer, Comparer) toujours visible + Niveau 2 = panneau contextuel 240-320px repliable par module
- UX-DR14: Implémenter les breadcrumbs cliquables avec dropdown des frères pour les 5 niveaux de navigation (Fichier → Individu → Dossier → Carte → Champ)
- UX-DR15: Implémenter la palette de commandes Ctrl+K disponible partout, avec recherche par nom, INSEE, NUDOS, résultats groupés par catégorie, et navigation directe vers l'élément

**Mode Édition**
- UX-DR16: Implémenter le toggle mode édition explicite dans le module Explorer avec indicateur visuel, compteur de modifications pendantes visible en permanence, et workflow explicite "Enregistrer / Annuler tout" (pas d'auto-save)

**Layout Explorer**
- UX-DR17: Implémenter les 4 types de vues contextuelles selon le niveau sélectionné dans l'arbre : Fichier → fiche synthétique, Individu → fiche synthétique, Dossier → fiche synthétique, Carte → 2 panneaux verticaux (détail champs + vue brute segmentée) avec séparateur redimensionnable (proportions par défaut 65%/35%)

**Patterns de Feedback**
- UX-DR18: Implémenter le système de toasts : succès (vert, 3s auto-dismiss), erreur (rouge, persistant), warning (ambre, 5s), info (bleu, 3s). Position bas à droite, empilés. Jamais de modale bloquante pour les notifications
- UX-DR19: Implémenter les états vides pour chaque contexte : premier lancement, Explorer sans fichier, Comparer sans fichiers, recherche sans résultat, comparaison sans différence — chacun avec message et action contextuelle
- UX-DR20: Implémenter les indicateurs de chargement contextuels : barre de progression pour import/export, spinner avec message pour la comparaison. Pas de spinner seul sans message

**Accessibilité**
- UX-DR21: Implémenter le double encodage systématique couleur + symbole pour tous les éléments visuels : diff (+/−/~), validation (✓/⏳/✗), sévérité (🚫/⚠️/ℹ️), types de carte (code texte), segmentation vue brute (infobulle), chrome contexte (label textuel)
- UX-DR22: Implémenter la navigation clavier complète : Tab pour tous les éléments interactifs, F6 pour basculer entre panneaux, raccourcis globaux (Ctrl+K, Ctrl+I/E/M, Ctrl+Shift+E, Ctrl+S, Ctrl+Z), skip link "Aller au contenu principal", focus visible 2px solid accent offset 2px
- UX-DR23: Implémenter la sémantique HTML et ARIA : role="tree" pour l'arbre, role="list" pour la vue brute, role="grid" pour la grille de comparaison, role="log" aria-live="polite" pour le panneau de validation, aria-label sur toutes les zones et éléments interactifs

**Adaptation Résolutions Desktop**
- UX-DR24: Supporter 3 résolutions cibles : 1366x768 (minimum — sidebar L2 repliée par défaut, métriques 2 colonnes), 1920x1080 (référence — sidebar L2 ouverte 260px, proportions par défaut), 2560x1440+ (sidebar L2 jusqu'à 320px, grille 4 colonnes)
- UX-DR25: Implémenter les panneaux redimensionnables avec contraintes (sidebar L2 min 200px/max 400px/repliable, panneaux détail/brut min 100px chacun, double-clic = réinitialiser) et mémorisation des proportions dans les préférences utilisateur

**Raccourcis Clavier**
- UX-DR26: Implémenter les raccourcis clavier de l'application : Ctrl+K (palette), Ctrl+I/E/M (navigation modules), Ctrl+Shift+E (toggle édition), Ctrl+S (enregistrer), Ctrl+Z (annuler), flèches dans l'arbre, Enter pour sélectionner

## FR Coverage Map

- FR1: Epic 1 — Création de compte utilisateur local
- FR2: Epic 1 — Authentification pour accéder à l'application
- FR3: Epic 1 — Cloisonnement des données par utilisateur
- FR4: Epic 1 — Déconnexion de l'application
- FR5: Epic 2 — Import fichier GEST via boîte de dialogue
- FR6: Epic 2 — Import fichier GEST par glisser-déposer
- FR7: Epic 2 — Validation longueur de ligne (204 caractères)
- FR8: Epic 2 — Validation encodage (Windows-1252)
- FR9: Epic 2 — Validation schéma par type de carte
- FR10: Epic 2 — Rapport de validation après import
- FR11: Epic 2 — Décodage en-tête de bande GEST
- FR12: Epic 2 — Identification et classement des 31 types de cartes
- FR44: Epic 2 — Suppression d'une bande GEST importée et de toutes ses données associées
- FR13: Epic 3 — Visualisation en-tête de bande décodé
- FR14: Epic 3 — Visualisation des cartes avec champs décodés et libellés
- FR15: Epic 3 — Navigation par individu (INSEE/NUDOS)
- FR16: Epic 3 — Navigation par type de carte
- FR17: Epic 3 — Filtrage par type de carte
- FR18: Epic 3 — Détail d'une carte avec champs positionnels décodés
- FR19: Epic 4 — Modification d'un champ via formulaire d'édition
- FR20: Epic 4 — Validation temps réel contre le schéma
- FR21: Epic 4 — Blocage des valeurs non conformes
- FR22: Epic 4 — Intégrité de la ligne à 204 caractères après modification
- FR23: Epic 4 — Reconstruction de la ligne brute après modification
- FR24: Epic 5 — Sélection fichier référence et fichiers cibles
- FR25: Epic 5 — Appariement des cartes par clés spécifiques
- FR26: Epic 5 — Détection des écarts champ par champ
- FR27: Epic 5 — Identification des cartes orphelines
- FR28: Epic 5 — Identification des doublons
- FR29: Epic 5 — Identification des cartes non appariables automatiquement
- FR30: Epic 5 — Appariement manuel des cartes
- FR31: Epic 5 — Exclusion de types de cartes de la comparaison
- FR32: Epic 5 — Visualisation des résultats de comparaison détaillés
- FR33: Epic 5 — Consultation des métriques de comparaison
- FR34: Epic 4 — Export fichier GEST modifié (204 car., Windows-1252)
- FR35: Epic 4 — Validation complète avant export
- FR36: Epic 4 — Rapport de validation avant export
- FR37: Epic 5 — Export résultats de comparaison en Excel
- FR38: Epic 4 — Choix emplacement de sauvegarde via dialogue native
- FR39: Epic 1 — Stockage dans base SQLite locale
- FR40: Epic 1 — Chiffrement de toutes les données au repos
- FR41: Epic 1 — Données inaccessibles en clair application fermée
- FR42: Epic 1 — Association des données à l'utilisateur authentifié
- FR43: Epic 1 — Nettoyage des données sensibles en mémoire à la fermeture
