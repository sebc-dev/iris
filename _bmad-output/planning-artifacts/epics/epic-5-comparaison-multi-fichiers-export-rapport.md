# Epic 5 : Comparaison Multi-Fichiers & Export Rapport

L'utilisateur peut comparer un fichier GEST de référence avec un ou plusieurs fichiers cibles. Le système apparie les cartes par clés, détecte les écarts champ par champ, identifie les orphelins et doublons, et affiche un dashboard statistique avec drill-down vers les différences détaillées. Le rapport peut être exporté en Excel. Workflow complet de Marc pour la validation de migration.

## Story 5.1 : Configuration et lancement de la comparaison

As a utilisateur (Marc),
I want sélectionner un fichier de référence et un ou plusieurs fichiers cibles avec des options de comparaison,
So that je puisse configurer précisément la comparaison avant de la lancer.

**Acceptance Criteria:**

**Given** l'utilisateur est connecté et ouvre le module Comparer
**When** la page s'affiche
**Then** la sidebar L2 affiche le panneau de configuration de comparaison
**And** une zone de sélection du fichier de référence est visible (dropdown des fichiers importés)
**And** une zone de sélection d'un ou plusieurs fichiers cibles est visible (FR24)

**Given** aucun fichier n'est importé ou un seul fichier est disponible
**When** le module Comparer s'affiche
**Then** un état vide est affiché : "Importez au moins 2 fichiers GEST pour comparer." avec un lien vers le module Importer (UX-DR19)

**Given** les fichiers référence et cible(s) sont sélectionnés
**When** l'utilisateur consulte les options de comparaison
**Then** des checkboxes permettent d'exclure des types de cartes de la comparaison (FR31)
**And** des checkboxes permettent d'inclure/exclure les champs de la partie commune (GCORR, datePaye, chaînePaye, numRemise, codeMIN, codeADM, codeDPT)
**And** un input numérique permet de définir une tolérance d'arrondi
**And** les valeurs par défaut sont : aucune exclusion de type, tous les champs communs inclus, tolérance 0

**Given** les fichiers et options sont configurés
**When** l'utilisateur clique sur "Lancer la comparaison" (bouton primaire)
**Then** la comparaison démarre
**And** un spinner avec message contextuel "Comparaison en cours... [N] cartes analysées" est affiché (UX-DR20)

**Given** un type de carte est exclu de la comparaison
**When** la comparaison s'exécute
**Then** les cartes de ce type sont totalement ignorées et ne génèrent ni différence ni orphelin (FR31)

## Story 5.2 : Moteur de comparaison

As a utilisateur (Marc),
I want que le système apparie automatiquement les cartes et détecte toutes les différences,
So that je puisse voir précisément ce qui a changé entre les fichiers de référence et cibles sans analyse manuelle.

**Acceptance Criteria:**

**Given** la comparaison est lancée
**When** le service `gestComparer.ts` traite les fichiers
**Then** les cartes entre référence et cibles sont appariées selon les clés d'appariement spécifiques à chaque type de carte (définies dans `card_schemas`) (FR25)
**And** la comparaison de deux fichiers de 10 000 lignes s'effectue en moins de 10 secondes (NFR4)

**Given** deux cartes sont appariées
**When** le moteur compare leurs champs
**Then** chaque champ est comparé individuellement et les écarts de valeur sont détectés (FR26)
**And** la tolérance numérique est appliquée aux champs numériques si configurée

**Given** une carte existe en référence mais pas en comparaison
**When** le moteur analyse les résultats
**Then** la carte est marquée comme orpheline côté référence (FR27)

**Given** une carte existe en comparaison mais pas en référence
**When** le moteur analyse les résultats
**Then** la carte est marquée comme orpheline côté comparaison (FR27)

**Given** une clé d'appariement correspond à plusieurs cartes
**When** le moteur détecte le cas
**Then** les cartes sont marquées comme doublons (correspondances multiples) (FR28)

**Given** un type de carte a une combinaison de champs qui ne permet pas une correspondance unique
**When** le moteur tente l'appariement automatique
**Then** les cartes sont marquées comme "appariement automatique impossible" (FR29)
**And** elles sont mises en attente d'appariement manuel

**Given** le moteur de comparaison existe
**When** je vérifie les tests
**Then** `gestComparer.test.ts` couvre : appariement par clés simples, appariement par clés composites, détection d'écarts champ par champ, tolérance numérique, orphelins côté référence et comparaison, doublons, cartes non appariables, exclusion de types de cartes

## Story 5.3 : Dashboard statistique et drill-down

As a utilisateur (Marc),
I want voir un résumé statistique de la comparaison avec des métriques cliquables pour explorer les détails,
So that j'aie une vue d'ensemble immédiate avant de plonger dans les détails des différences.

**Acceptance Criteria:**

**Given** la comparaison est terminée
**When** les résultats s'affichent
**Then** le composant `GestCompareDashboard` (UX-DR10) affiche des cartes stat cliquables :
- Cartes identiques (vert + nombre)
- Cartes modifiées (bleu + nombre)
- Cartes absentes en comparaison (rouge + nombre)
- Cartes nouvelles en comparaison (vert + nombre)
- Doublons (ambre + nombre)
- Appariement impossible (gris + nombre)
**And** les noms des fichiers référence et cible sont affichés en en-tête (FR33)

**Given** le dashboard affiche les métriques
**When** l'utilisateur clique sur une catégorie (ex: "Cartes modifiées")
**Then** la vue drill-down vers la grille de comparaison (Story 5.4) avec le filtre correspondant pré-appliqué (UX-DR10)

**Given** la comparaison ne détecte aucune différence
**When** le dashboard s'affiche
**Then** un indicateur de succès est affiché : "Les fichiers sont identiques. 0 différence détectée. ✓" (UX-DR19)
**And** la carte "Cartes identiques" est mise en avant

**Given** le dashboard est affiché
**When** l'utilisateur clique sur "Exporter" (bouton secondaire)
**Then** le flux d'export Excel est déclenché (Story 5.5)

**Given** les métriques sont affichées
**When** je vérifie l'accessibilité
**Then** chaque carte stat est focusable au clavier avec `aria-label` décrivant la métrique (UX-DR10)
**And** le double encodage couleur + symbole est respecté pour chaque catégorie (UX-DR21)

## Story 5.4 : Grille de comparaison détaillée et appariement manuel

As a utilisateur (Marc, Karim),
I want voir les différences champ par champ dans une grille navigable et pouvoir apparier manuellement les cartes ambiguës,
So that je puisse analyser chaque écart en détail et résoudre les cas que le moteur ne peut pas apparier automatiquement.

**Acceptance Criteria:**

**Given** l'utilisateur est dans la vue drill-down de comparaison
**When** la grille de comparaison s'affiche (GestCompareGrid — UX-DR9)
**Then** les colonnes affichent : indicateur (+/−/~), INSEE, NUDOS, Individu, Type carte, Champ, Valeur référence, Valeur comparaison (FR32)
**And** chaque ligne est colorée par type de différence : vert ajout, rouge suppression, bleu modification (UX-DR9)
**And** une icône dans la colonne indicateur double-encode le type (+/−/~) (UX-DR21)

**Given** la grille affiche des différences
**When** l'utilisateur utilise les boutons ◀ ▶
**Then** la navigation saute de différence en différence avec un compteur "Différence N/M" (UX-DR9)

**Given** la grille est affichée
**When** l'utilisateur active des filtres
**Then** des chips de filtre permettent de filtrer par type de changement (ajout, suppression, modification) et par type de carte (UX-DR9)
**And** les filtres sont cumulables et le compteur se met à jour

**Given** des cartes sont marquées "appariement automatique impossible"
**When** l'utilisateur consulte ces cartes
**Then** elles sont affichées dans une section dédiée avec les candidats possibles
**And** l'utilisateur peut sélectionner manuellement la correspondance entre une carte référence et une carte cible (FR30)
**And** après appariement manuel, la comparaison champ par champ est recalculée pour cette paire

**Given** la grille contient de nombreuses lignes (10 000+)
**When** l'utilisateur scrolle
**Then** la grille utilise la virtualisation pour maintenir une performance fluide
**And** la navigation reste réactive (< 200ms)

**Given** la grille est affichée
**When** je vérifie l'accessibilité
**Then** la grille utilise `role="grid"` avec `aria-rowcount` et `aria-colcount` (UX-DR23)
**And** la navigation clavier entre cellules fonctionne
**And** les filtres sont accessibles au clavier

## Story 5.5 : Export du rapport de comparaison en Excel

As a utilisateur (Marc),
I want exporter les résultats de comparaison en format Excel,
So that je puisse partager le rapport avec mon équipe de développement pour décider de la mise en production.

**Acceptance Criteria:**

**Given** une comparaison est terminée et les résultats sont affichés
**When** l'utilisateur clique sur le bouton "Exporter en Excel" (dans le dashboard ou la grille)
**Then** une boîte de dialogue native Tauri s'ouvre pour choisir l'emplacement de sauvegarde (FR37)
**And** le nom de fichier par défaut inclut les noms des fichiers comparés et la date (ex: `comparaison_REF_vs_CIBLE_2026-03-22.xlsx`)

**Given** l'utilisateur a choisi un emplacement
**When** l'export s'exécute
**Then** la commande Rust `export_compare_excel` génère le fichier Excel via un crate Rust (ex: rust_xlsxwriter)
**And** le fichier contient : un onglet résumé (métriques globales), un onglet par catégorie de différence (modifiées, orphelines référence, orphelines comparaison, doublons)
**And** chaque onglet de détail inclut les colonnes : INSEE, NUDOS, Individu, Type carte, Champ, Valeur référence, Valeur comparaison
**And** une barre de progression est affichée pendant la génération (UX-DR20)

**Given** l'export Excel est terminé
**When** le fichier est écrit sur le disque
**Then** un toast de succès est affiché avec le chemin du fichier (UX-DR18)

**Given** l'export échoue
**When** une erreur survient
**Then** un toast d'erreur persistant est affiché avec un message descriptif
**And** aucun fichier corrompu n'est laissé sur le disque

**Given** l'utilisateur annule la boîte de dialogue
**When** aucun emplacement n'est sélectionné
**Then** l'export est annulé sans effet de bord
