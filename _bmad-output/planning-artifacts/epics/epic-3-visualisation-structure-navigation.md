# Epic 3 : Visualisation Structurée & Navigation

L'utilisateur peut explorer un fichier GEST importé via une interface structurée : en-tête de bande décodé, navigation hiérarchique par individu et type de carte, fiches synthétiques contextuelles, vue détaillée avec champs décodés et vue brute segmentée colorée. C'est le cœur de la proposition de valeur — le moment "aha".

## Story 3.1 : Layout applicatif et sidebar multi-niveaux

As a utilisateur,
I want une interface structurée avec une sidebar de navigation et des breadcrumbs,
So that je puisse naviguer entre les modules (Importer, Explorer, Comparer) et toujours savoir où je me trouve dans l'application.

**Acceptance Criteria:**

**Given** l'utilisateur est connecté
**When** l'application affiche le layout principal
**Then** une sidebar Niveau 1 est toujours visible (48px de large) avec les icônes des modules : Importer, Explorer, Comparer (UX-DR13)
**And** un séparateur visuel sépare les modules de l'action Paramètres/Déconnexion en bas
**And** chaque icône a un `aria-label` descriptif

**Given** l'utilisateur clique sur un module dans la sidebar L1
**When** le module est activé
**Then** la sidebar Niveau 2 s'ouvre avec le contenu contextuel du module sélectionné (UX-DR13)
**And** la route SvelteKit correspondante est chargée (/importer, /explorer, /comparer)
**And** le module actif est visuellement indiqué dans la sidebar L1 (fond coloré/bordure)

**Given** la sidebar L2 est ouverte
**When** l'utilisateur interagit avec le séparateur redimensionnable
**Then** la sidebar L2 peut être redimensionnée entre 200px et 400px (UX-DR25)
**And** la sidebar L2 peut être repliée à 0px via un toggle
**And** un double-clic sur le séparateur réinitialise la largeur par défaut (260px)
**And** les proportions sont mémorisées dans les préférences utilisateur (SQLite)

**Given** l'utilisateur navigue dans le module Explorer
**When** un élément est sélectionné (fichier, individu, dossier, carte)
**Then** des breadcrumbs cliquables affichent le chemin complet : Fichier > Individu > Dossier > Carte (UX-DR14)
**And** chaque segment de breadcrumb est cliquable pour remonter au niveau correspondant
**And** le breadcrumb courant utilise `aria-current="page"` (UX-DR23)
**And** la barre breadcrumbs + toolbar fait 40px de haut

**Given** la résolution de l'écran est 1366x768
**When** l'application s'affiche
**Then** la sidebar L2 est repliée par défaut (UX-DR24)
**And** le contenu central occupe la largeur maximale disponible

**Given** la résolution est 1920x1080 ou supérieure
**When** l'application s'affiche
**Then** la sidebar L2 est ouverte par défaut à 260px (UX-DR24)

**Given** les raccourcis clavier sont configurés
**When** l'utilisateur appuie sur Ctrl+I, Ctrl+E ou Ctrl+M
**Then** il bascule respectivement vers le module Importer, Explorer ou Comparer (UX-DR26)

## Story 3.2 : Arbre hiérarchique et fiches synthétiques

As a utilisateur (Sophie, Karim, Amélie),
I want naviguer dans la hiérarchie d'un fichier GEST (Fichier → Individu → Dossier → Carte) via un arbre et des fiches synthétiques,
So that je puisse trouver rapidement n'importe quelle donnée en moins de 3 clics.

**Acceptance Criteria:**

**Given** un fichier GEST a été importé et parsé
**When** l'utilisateur ouvre le module Explorer
**Then** la sidebar L2 affiche le composant `GestHierarchyTree` (UX-DR7)
**And** l'arbre présente 4 niveaux : Fichier (📄) → Individu (👤) → Dossier (📁) → Carte (📋) avec icônes différenciées
**And** chaque nœud affiche un badge compteur d'enfants
**And** l'arbre utilise `role="tree"` avec des nœuds `role="treeitem"` et `aria-expanded` (UX-DR23)

**Given** l'arbre est affiché
**When** l'utilisateur sélectionne le nœud Fichier (racine)
**Then** la vue centrale affiche une fiche synthétique Fichier (UX-DR8, UX-DR17) : en-tête de bande décodé (correspondance, date de paye, chaîne, ministère, administration, département), métriques en cartes stat (lignes OK/KO, types de cartes, nombre d'individus), liste cliquable des individus (FR13)

**Given** l'utilisateur est sur la fiche synthétique Fichier
**When** il clique sur un individu dans la liste
**Then** la vue centrale affiche la fiche synthétique Individu (UX-DR8) : INSEE, nom, nombre de dossiers, résumé par dossier avec types de cartes, liste cliquable des dossiers (FR15)
**And** l'arbre se synchronise : le nœud Individu est sélectionné et déplié
**And** les breadcrumbs se mettent à jour

**Given** l'utilisateur est sur la fiche synthétique Individu
**When** il clique sur un dossier dans la liste
**Then** la vue centrale affiche la fiche synthétique Dossier (UX-DR8) : NUDOS, individu parent, liste des cartes avec type, libellé et aperçu des premiers champs, liste cliquable des cartes (FR14, FR15)
**And** l'arbre et les breadcrumbs se synchronisent

**Given** l'arbre est affiché
**When** l'utilisateur sélectionne directement un nœud dans l'arbre (à n'importe quel niveau)
**Then** la vue centrale se met à jour avec la fiche/vue correspondante
**And** les breadcrumbs se synchronisent
**And** la navigation s'effectue en moins de 200ms (NFR3)

**Given** un champ de recherche est affiché en haut de la sidebar L2
**When** l'utilisateur tape du texte
**Then** l'arbre est filtré en temps réel par nom, INSEE ou NUDOS (UX-DR7)
**And** les nœuds parents restent visibles quand un enfant matche
**And** le texte recherché est surligné dans les résultats
**And** un bouton "×" permet d'effacer le filtre

**Given** le module Explorer est ouvert sans fichier importé
**When** l'utilisateur voit la page
**Then** un état vide est affiché : "Aucun fichier importé. Importez un fichier GEST pour l'explorer." avec un lien vers le module Importer (UX-DR19)

## Story 3.3 : Vue détaillée d'une carte et vue brute segmentée

As a utilisateur (Sophie, Karim),
I want voir les champs décodés d'une carte avec leurs libellés et la ligne brute de 204 caractères segmentée par couleurs,
So that je comprenne immédiatement chaque donnée sans compter manuellement les positions de caractères.

**Acceptance Criteria:**

**Given** l'utilisateur sélectionne une carte dans l'arbre ou dans une fiche synthétique
**When** la vue carte s'affiche
**Then** la zone centrale se divise en 2 panneaux verticaux (UX-DR17) : panneau haut = détail des champs décodés, panneau bas = vue brute segmentée
**And** les panneaux sont séparés par un séparateur horizontal redimensionnable (Resizable shadcn-svelte)
**And** les proportions par défaut sont 65% détail / 35% vue brute (UX-DR25)
**And** chaque panneau a un minimum de 100px, double-clic réinitialise les proportions

**Given** le panneau détail est affiché
**When** l'utilisateur consulte les champs
**Then** chaque champ est affiché avec : libellé en français, type de donnée, positions (début-fin), valeur décodée (FR18)
**And** les champs sont présentés en formulaire structuré (lecture seule — l'édition viendra dans l'Epic 4)
**And** un indicateur de navigation ◀ N/M ▶ permet de naviguer entre les cartes du même dossier
**And** la navigation entre cartes met à jour l'arbre et les breadcrumbs

**Given** le panneau vue brute est affiché (GestRawView — UX-DR5)
**When** l'utilisateur consulte la ligne de 204 caractères
**Then** la ligne s'affiche sur une seule ligne en police JetBrains Mono
**And** chaque champ est segmenté avec une couleur de fond alternée (palette de 8 teintes pastel)
**And** les segments utilisent `role="list"` avec chaque segment en `role="listitem"` et `aria-label="[nom du champ]: [valeur]"` (UX-DR23)

**Given** la vue brute est affichée
**When** l'utilisateur survole un segment coloré
**Then** une infobulle s'affiche avec : nom du champ, type, positions, valeur décodée (UX-DR5)

**Given** la vue est affichée en mode synchronisé
**When** l'utilisateur survole un champ dans le panneau détail
**Then** le segment correspondant dans la vue brute est surligné (outline dorée) (UX-DR5)
**And** inversement : survol d'un segment brut → surlignage du champ dans le détail

**Given** l'utilisateur clique sur un segment dans la vue brute
**When** le segment est cliqué
**Then** le champ correspondant est sélectionné dans le panneau détail
**And** le panneau détail scrolle jusqu'au champ si nécessaire

**Given** les champs sont affichés
**When** je vérifie l'accessibilité
**Then** le double encodage couleur + symbole est respecté : la segmentation colorée est accompagnée d'infobulles au survol (UX-DR21)
**And** tous les champs ont des labels associés (NFR13)
**And** le contraste est suffisant (NFR15)

## Story 3.4 : Navigation par type de carte et filtrage

As a utilisateur (Karim),
I want filtrer l'affichage par type de carte et naviguer directement vers un type spécifique,
So that je puisse cibler mon investigation sur les cartes qui m'intéressent sans parcourir tout le fichier.

**Acceptance Criteria:**

**Given** l'arbre hiérarchique est affiché
**When** l'utilisateur active un filtre par type de carte
**Then** seules les cartes du type sélectionné restent visibles dans l'arbre (FR17)
**And** les nœuds parents (Fichier, Individu, Dossier) restent visibles si au moins un de leurs enfants matche
**And** les badges compteurs se mettent à jour pour refléter le filtre
**And** le filtre est indiqué visuellement (chip/badge actif)

**Given** un filtre par type de carte est actif
**When** l'utilisateur clique sur le bouton "×" du filtre
**Then** le filtre est supprimé et l'arbre complet est restauré

**Given** l'utilisateur navigue dans l'arbre
**When** il souhaite voir toutes les cartes d'un type donné
**Then** il peut naviguer par type de carte via un sélecteur/dropdown accessible depuis la toolbar (FR16)
**And** la sélection d'un type affiche la liste de toutes les cartes de ce type, groupées par individu/dossier

**Given** les types de cartes sont affichés
**When** je vérifie l'accessibilité
**Then** chaque type de carte est identifié par un badge avec code texte (01, 05, 22, 40...) en plus de la couleur (UX-DR21)
**And** les filtres sont accessibles au clavier

**Given** le filtrage est actif
**When** l'utilisateur navigue entre les éléments filtrés
**Then** la navigation s'effectue en moins de 200ms (NFR3)

## Story 3.5 : Palette de commandes et raccourcis clavier

As a utilisateur (Karim, Marc),
I want accéder à une palette de commandes Ctrl+K pour rechercher et naviguer directement vers n'importe quel élément,
So that je puisse sauter instantanément à un individu, un dossier ou une carte sans parcourir l'arbre manuellement.

**Acceptance Criteria:**

**Given** l'utilisateur est n'importe où dans l'application
**When** il appuie sur Ctrl+K
**Then** la palette de commandes s'ouvre (composant Command de shadcn-svelte) (UX-DR15)
**And** le champ de recherche est automatiquement focusé

**Given** la palette est ouverte
**When** l'utilisateur tape du texte
**Then** les résultats sont filtrés en temps réel par nom d'individu, numéro INSEE, NUDOS, numéro de dossier (UX-DR15)
**And** les résultats sont groupés par catégorie (Individus, Dossiers, Cartes)
**And** chaque résultat affiche le contexte (ex: "Dupont Marie — INSEE 1234567890123 — Dossier 01")

**Given** la palette affiche des résultats
**When** l'utilisateur sélectionne un résultat (clic ou Enter)
**Then** la navigation est effectuée directement vers l'élément sélectionné
**And** l'arbre se synchronise (sélection + dépliage du chemin)
**And** les breadcrumbs se mettent à jour
**And** la vue centrale affiche la fiche/vue correspondante
**And** la palette se ferme

**Given** la palette est ouverte
**When** l'utilisateur appuie sur Escape
**Then** la palette se ferme sans navigation

**Given** l'utilisateur est dans le module Explorer
**When** il utilise les raccourcis clavier de navigation dans l'arbre
**Then** ↑/↓ navigue entre les nœuds, ←/→ replie/déplie, Enter sélectionne, Home/End va au premier/dernier nœud visible (UX-DR22, UX-DR26)

**Given** l'utilisateur est dans le module Explorer avec les panneaux affichés
**When** il appuie sur F6
**Then** le focus bascule entre les zones : sidebar L2 (arbre) → panneau détail → vue brute (UX-DR22)
**And** Escape remonte le focus au panneau parent

**Given** la page est chargée
**When** l'utilisateur commence à naviguer au clavier (Tab)
**Then** un skip link "Aller au contenu principal" est le premier élément focusable (UX-DR22)
**And** le focus est visible avec un outline 2px solid accent offset 2px
**And** l'ordre de tabulation suit : sidebar L1 → sidebar L2 → toolbar/breadcrumbs → contenu principal
