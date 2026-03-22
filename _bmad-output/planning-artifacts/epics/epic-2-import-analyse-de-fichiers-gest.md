# Epic 2 : Import & Analyse de Fichiers GEST

L'utilisateur peut importer un fichier GEST, le système valide automatiquement chaque ligne, décode l'en-tête de bande, classe les cartes par type parmi les 31 types supportés, et affiche un rapport de validation complet. Le fichier est persisté dans la BDD chiffrée. L'utilisateur peut également supprimer une bande importée et toutes ses données associées. Point d'entrée de tous les parcours utilisateurs.

## Story 2.1 : Schémas des 31 types de cartes GEST en base SQLite

As a développeur,
I want que les définitions des 31 types de cartes GEST soient stockées en base SQLite,
So that le parsing, la validation et l'édition puissent s'appuyer sur des schémas déclaratifs évolutifs plutôt que sur du code en dur.

**Acceptance Criteria:**

**Given** l'application démarre après la mise à jour
**When** les migrations s'exécutent
**Then** les tables `card_schemas` et `card_fields` sont créées
**And** `card_schemas` contient une entrée par type de carte (31 types) avec : code carte, libellé, description
**And** `card_fields` contient les définitions de champs pour chaque type de carte : nom du champ, position de début, longueur, type de donnée (alphanumérique, numérique, date...), valeurs autorisées le cas échéant, libellé en français

**Given** les schémas sont en base
**When** une commande Tauri `get_schemas` est invoquée
**Then** elle retourne la liste des types de cartes avec leurs champs, typée via tauri-specta
**And** les types TypeScript correspondants sont générés (`CardSchema`, `CardField` dans `src/lib/types/gest.ts`)

**Given** les schémas sont en base
**When** un nouveau type de carte GEST doit être ajouté ou un champ modifié
**Then** une nouvelle migration SQL suffit — aucune modification de code n'est nécessaire

**Given** les schémas incluent les champs de la partie commune des cartes
**When** je consulte la définition d'un type de carte
**Then** les champs communs à toutes les cartes (GCORR, datePaye, chaînePaye, numRemise, codeMIN, codeADM, codeDPT) sont identifiés comme tels
**And** les clés d'appariement spécifiques à chaque type de carte sont définies (pour la comparaison future)

## Story 2.2 : Import de fichier GEST via dialogue et décodage Windows-1252

As a utilisateur (Sophie, Marc, Karim, Amélie),
I want importer un fichier GEST depuis mon système de fichiers via une boîte de dialogue,
So that le fichier soit chargé dans IRIS avec son encodage Windows-1252 correctement géré et ses lignes brutes stockées de manière sécurisée.

**Acceptance Criteria:**

**Given** l'utilisateur est connecté et se trouve sur le module Importer
**When** il clique sur le bouton "Parcourir" ou "Importer un fichier"
**Then** une boîte de dialogue native Tauri s'ouvre pour la sélection de fichier (FR5)
**And** le filtre propose les fichiers GEST par défaut

**Given** l'utilisateur a sélectionné un fichier GEST
**When** le système traite le fichier
**Then** la commande Rust `import_file` lit le fichier depuis le disque
**And** l'encodage Windows-1252 est détecté et décodé via encoding_rs (FR8)
**And** les lignes brutes (204 caractères chacune) sont stockées en BDD associées au `user_id` courant
**And** les métadonnées du fichier (nom, chemin d'origine, date d'import, nombre de lignes) sont stockées dans la table `gest_files`

**Given** un fichier GEST est en cours d'import
**When** l'import est en cours
**Then** une barre de progression est affichée avec le nom du fichier (UX-DR20)
**And** l'import d'un fichier de 10 000 lignes s'effectue en moins de 5 secondes (NFR1)

**Given** l'import est terminé
**When** le résultat est retourné au frontend
**Then** un toast de succès est affiché avec le nombre de lignes importées (UX-DR18)
**And** les données brutes sont accessibles via la commande Tauri `get_file_lines`

**Given** le fichier sélectionné n'est pas un fichier GEST valide (binaire, vide, autre format)
**When** le système tente l'import
**Then** un message d'erreur clair est affiché via toast persistant (pas de modale)
**And** aucune donnée corrompue n'est stockée en base

**Given** le module Importer est affiché sans fichier importé
**When** l'utilisateur voit la page
**Then** un état vide est affiché : "Importez votre premier fichier GEST pour commencer" avec un bouton d'import visible (UX-DR19)

## Story 2.3 : Parsing positionnel et classification des cartes

As a utilisateur,
I want que le système décode automatiquement l'en-tête de bande et classe chaque ligne par type de carte,
So that je puisse voir les données structurées au lieu de 204 caractères bruts incompréhensibles.

**Acceptance Criteria:**

**Given** un fichier GEST a été importé et les lignes brutes sont en BDD
**When** le service TypeScript `gestParser.ts` traite les lignes
**Then** la première ligne est décodée comme en-tête de bande GEST : code correspondance, date de paye, chaîne de paye, ministère, administration, département (FR11)
**And** chaque ligne est classée par type de carte parmi les 31 types supportés, en se basant sur le code carte aux positions définies par le schéma (FR12)
**And** les champs de chaque carte sont extraits selon les positions définies dans `card_schemas`/`card_fields`

**Given** le parsing est terminé
**When** les données structurées sont prêtes
**Then** les champs décodés sont stockés en BDD (modèle hybride : ligne brute + champs décodés en colonnes)
**And** les individus sont identifiés par leur INSEE et regroupés
**And** les dossiers de paie (NUDOS) sont identifiés au sein de chaque individu
**And** l'affichage structuré est disponible en moins de 500ms après l'import (NFR2)

**Given** une ligne a un code carte non reconnu (hors des 31 types)
**When** le parser la traite
**Then** la ligne est classée comme "type inconnu" et conservée en brut
**And** elle est signalée dans le rapport de validation

**Given** le service de parsing existe
**When** je vérifie les tests
**Then** `gestParser.test.ts` couvre : décodage en-tête de bande, classification des 31 types, extraction des champs positionnels, gestion des types inconnus

## Story 2.4 : Validation multi-niveaux et rapport de validation

As a utilisateur (Sophie, Amélie),
I want voir un rapport de validation complet après import avec les lignes OK, KO et le détail des erreurs,
So that je sache immédiatement si mon fichier GEST est valide et où se trouvent les anomalies.

**Acceptance Criteria:**

**Given** un fichier GEST a été importé et parsé
**When** le service `gestValidator.ts` exécute la validation
**Then** chaque ligne est validée sur sa longueur exacte de 204 caractères (FR7)
**And** l'encodage Windows-1252 est vérifié (FR8)
**And** chaque ligne est validée contre le schéma spécifique de son type de carte : positions, formats, valeurs autorisées (FR9)

**Given** la validation est terminée
**When** le rapport de validation s'affiche (GestValidationPanel variante import — UX-DR11)
**Then** l'utilisateur voit les métriques en cartes stat : nombre total de lignes, lignes OK (vert), lignes KO (rouge), nombre de types de cartes détectés, nombre d'individus (FR10)
**And** une liste navigable d'erreurs est affichée avec : numéro de ligne (monospace), badge type d'erreur (LONGUEUR, ENCODAGE, SCHÉMA), message descriptif
**And** le rapport s'affiche automatiquement après l'import (pas d'étape manuelle)

**Given** le rapport de validation est affiché
**When** l'utilisateur clique sur une erreur dans la liste
**Then** l'erreur est mise en surbrillance avec les détails complets (ligne concernée, champ en erreur, valeur attendue vs trouvée)

**Given** le rapport montre des lignes KO
**When** l'utilisateur a terminé sa consultation
**Then** un bouton "Explorer le fichier →" est visible et accessible pour basculer vers le module Explorer (bouton primaire — seul bouton primaire de l'écran)

**Given** toutes les lignes sont OK
**When** le rapport s'affiche
**Then** un indicateur de succès clair est visible (vert, ✓)
**And** le bouton "Explorer le fichier →" est mis en avant

**Given** le rapport de validation est affiché
**When** je vérifie l'accessibilité
**Then** le panneau utilise `role="log"` avec `aria-live="polite"` (UX-DR23)
**And** les badges d'erreur ont un double encodage couleur + symbole (UX-DR21)
**And** les éléments sont navigables au clavier

**Given** le service de validation existe
**When** je vérifie les tests
**Then** `gestValidator.test.ts` couvre : validation longueur (OK et KO), validation encodage, validation schéma par type de carte, génération du rapport avec métriques correctes

## Story 2.5 : Import par glisser-déposer

As a utilisateur,
I want importer un fichier GEST en le faisant glisser depuis l'explorateur Windows vers l'application,
So that l'import soit encore plus rapide et naturel, sans passer par une boîte de dialogue.

**Acceptance Criteria:**

**Given** l'utilisateur est connecté et se trouve sur le module Importer
**When** il fait glisser un fichier depuis l'explorateur Windows vers la zone de drop
**Then** la zone de drop affiche un indicateur visuel de survol (bordure colorée, changement de fond) (FR6)
**And** le fichier est importé avec le même flux que l'import via dialogue (décodage Win-1252, stockage, parsing, validation, rapport)

**Given** l'utilisateur fait glisser un fichier
**When** le fichier est déposé en dehors de la zone de drop
**Then** rien ne se passe — pas d'erreur, pas d'import

**Given** l'utilisateur fait glisser plusieurs fichiers simultanément
**When** les fichiers sont déposés
**Then** chaque fichier est importé séquentiellement
**And** un rapport de validation est généré pour chaque fichier

**Given** le module Importer est affiché
**When** aucun fichier n'est en cours d'import
**Then** la zone de drag & drop est visible avec un message d'invitation : "Glissez un fichier GEST ici ou cliquez pour parcourir" (UX-DR19)
**And** la zone occupe une place centrale et visible

## Story 2.6 : Suppression d'une bande GEST importée

As a utilisateur (Sophie, Marc, Karim),
I want supprimer une bande GEST importée que je n'ai plus besoin de conserver,
So that mes données restent organisées et que l'espace de stockage ne se charge pas de fichiers obsolètes.

**Acceptance Criteria:**

**Given** l'utilisateur est sur le module Importer et des fichiers importés sont listés
**When** il clique sur l'action de suppression d'un fichier
**Then** une confirmation est demandée via Dialog : "Supprimer la bande [nom du fichier] ? Toutes les données associées (lignes, champs décodés, résultats de comparaison) seront définitivement supprimées."

**Given** l'utilisateur confirme la suppression
**When** le système exécute la suppression
**Then** toutes les données associées au fichier sont supprimées de la BDD : lignes brutes, champs décodés, résultats de comparaison liés (FR44)
**And** le fichier disparaît de la liste des fichiers importés
**And** un toast de succès confirme la suppression (UX-DR18)

**Given** l'utilisateur annule la confirmation
**When** il clique sur "Annuler" dans le Dialog
**Then** rien n'est supprimé et la liste reste inchangée

**Given** le fichier supprimé était actuellement affiché dans le module Explorer
**When** la suppression est confirmée
**Then** le module Explorer affiche l'état vide : "Aucun fichier importé. Importez un fichier GEST pour l'explorer." (UX-DR19)

**Given** le fichier supprimé était utilisé dans une comparaison affichée dans le module Comparer
**When** la suppression est confirmée
**Then** les résultats de comparaison liés sont supprimés
**And** le module Comparer revient à l'état de sélection de fichiers

**Given** la suppression est une action destructive
**When** le bouton de suppression est affiché
**Then** il utilise le style destructif (bordure rouge, texte rouge)
**And** la confirmation via Dialog est obligatoire — jamais de suppression en un seul clic
