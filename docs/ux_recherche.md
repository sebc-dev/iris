# Inspirations UX pour IRIS : 30 applications décryptées sur 4 axes de design

**IRIS n'a aucun concurrent direct, mais ses défis UX — transformer 204 caractères opaques en données lisibles, naviguer dans une hiérarchie fichier → individu → carte → champ, éditer sans corrompre un format rigide, et comparer des fichiers de paie — sont résolus brillamment par des dizaines d'applications existantes.** Ce rapport identifie les patterns les plus transférables issus de 30 applications analysées sur 4 axes UX, avec des recommandations concrètes priorisées. Les trois inspirations les plus puissantes pour IRIS sont Wireshark (architecture trois panneaux synchronisés), ImHex (segmentation colorée des champs dans la vue brute) et Beyond Compare Table Compare (comparaison cellule par cellule alignée sur clés primaires). Combinés, ces patterns permettraient de construire une expérience où les gestionnaires de paie les moins techniques comprennent instantanément ce qu'ils voient, où ils sont dans la hiérarchie, et ce qui a changé entre deux fichiers.

---

## Résumé exécutif : les 15 applications les plus pertinentes

**Wireshark** est le modèle fondateur pour IRIS — son architecture trois panneaux (liste de paquets → détail décodé → octets bruts) est exactement le paradigme nécessaire pour afficher liste de lignes → champs structurés → ligne brute de 204 caractères. **ImHex** démontre la segmentation colorée des champs directement dans la vue brute, rendant la structure visible sans aucun décodage mental. **010 Editor** prouve que l'édition structurée de données binaires via des templates typés fonctionne à l'échelle industrielle. **VS Code** combine breadcrumbs pour la navigation hiérarchique, validation JSON Schema en temps réel, et un éditeur de diff inline/côte-à-côte de référence. **Beyond Compare** excelle en comparaison tabulaire avec alignement sur clés primaires — directement applicable à la comparaison de fichiers de paie par matricule. **TablePlus** montre le pattern change-tracking « code review » avant commit, idéal pour des données financières sensibles. **Linear** définit l'état de l'art en navigation « inverted L-shape » (sidebar + header) avec densité d'information maîtrisée. **Kaleidoscope** introduit le double encodage couleur + symbole pour l'accessibilité des diffs. **Monaco Constrained Editor Plugin** est le pattern le plus directement transférable pour l'édition contrainte par plage de caractères. **SAP Fiori** apporte le MaskInput positionnel, le mécanisme de brouillon, et le MessagePopover pour la collecte d'erreurs navigable. **Excel Data Validation** fournit le modèle à trois niveaux de sévérité (Stop/Warning/Info). **DiffEngineX** démontre la comparaison cellule par cellule de tableurs avec alignement sur colonnes-clés. **Beekeeper Studio** illustre une philosophie « Great Feels » — prioriser la clarté UX sur le nombre de fonctionnalités. **pgAdmin** combine arbre hiérarchique + panneaux à onglets pour naviguer dans des structures profondes. **Datafold** apporte le workflow résumé statistique → drill-down progressif pour la comparaison de datasets.

---

## Axe 1 — Visualisation de données denses : du brut au structuré

Ce premier axe est le cœur d'IRIS : transformer une ligne de 204 caractères, opaque pour un humain, en champs nommés, typés et lisibles. Huit applications majeures résolvent ce problème dans des contextes comparables.

### Les applications de référence

**ImHex** (hex editor open source, Windows/macOS/Linux, https://imhex.werwolv.net/) utilise un langage de patterns déclaratif pour parser des fichiers binaires en arborescences structurées. Le pattern UX central est la **coloration par champ dans la vue hexadécimale** : chaque champ défini reçoit une couleur distincte d'une palette de 8 à 12 teintes, et les octets correspondants dans la vue brute sont peints avec cette couleur. Un clic sur un nœud de l'arbre met en surbrillance les octets correspondants, et inversement — cette **synchronisation bidirectionnelle arbre ↔ vue brute** est le pattern le plus directement transférable à IRIS, où un clic sur un champ dans le panneau structuré pourrait surligner les caractères 45-52 dans la ligne de 204 caractères.

**010 Editor** (hex editor commercial, Windows/macOS/Linux, https://www.sweetscape.com/010editor/) pousse ce concept plus loin avec des Binary Templates industriels. Son panneau Template Results affiche six colonnes (Name, Value, Start, Size, Color, Comment) et rend la **colonne Value directement éditable** — un double-clic modifie la valeur, et le changement est écrit dans les données brutes. Ce pattern « édition dans la vue structurée, répercussion dans la vue brute » est exactement ce dont IRIS a besoin. L'éditeur dispose aussi d'un **histogramme de distribution** des octets, qui pourrait inspirer une barre d'aperçu montrant la validité ligne par ligne d'un fichier de paie.

**Wireshark** (analyseur réseau, multiplateforme, https://www.wireshark.org/) offre l'architecture de référence en **trois panneaux verticaux** : liste des paquets (tableau synthétique avec colonnes configurables, lignes colorées par protocole), détail du paquet sélectionné (arbre dépliable montrant les couches protocolaires), et dump hexadécimal (avec surbrillance du champ sélectionné). Les **champs générés** entre crochets `[TCP Analysis]` montrent des informations calculées absentes des données brutes — IRIS pourrait afficher de même des totaux calculés, des statuts de validation, ou des libellés décodés de codes.

**Kaitai Struct Web IDE** (parseur binaire déclaratif, navigateur, https://ide.kaitai.io/) démontre que ce paradigme fonctionne parfaitement dans un contexte web. Son format `.ksy` en YAML pourrait inspirer la spécification déclarative du format 204 caractères d'IRIS — un fichier unique qui pilote le parsing, la validation et la documentation. L'attribut `-webide-representation` permet de définir un résumé lisible pour chaque nœud de l'arbre (ex. : `"Agent 12345 — Indice 567 — Net: 2 345,67€"` au lieu de noms de champs techniques).

**Beekeeper Studio** (client SQL, multiplateforme, https://www.beekeeperstudio.io/) illustre une philosophie de design pertinente : la priorisation de la clarté sur la complétude fonctionnelle. Son **chrome de couleur par connexion** (toute l'interface prend la teinte de la base connectée) pourrait être adapté pour distinguer visuellement les fichiers de production (rouge) des fichiers de test (vert). Le **sidebar JSON** pour les cellules complexes et la **palette de commandes Cmd+K** sont également transférables.

**TablePlus** (client SQL natif, multiplateforme, https://tableplus.com/) apporte le **basculement grille ↔ formulaire** pour une même ligne de données : la vue grille montre toutes les lignes comme un tableur, la vue formulaire montre une seule ligne en détail avec tous ses champs. Ce pattern est directement applicable à IRIS — basculer entre « vue fichier » (toutes les lignes 204 chars en grille) et « vue individu » (un formulaire structuré pour une ligne).

**JSON Crack** (visualiseur JSON, web, https://jsoncrack.com/) et **DB Browser for SQLite** (navigateur SQLite, multiplateforme, https://sqlitebrowser.org/) complètent le panorama. JSON Crack démontre l'exploration spatiale de données (graphe de nœuds interactif) et le traitement 100% local — pertinent pour l'architecture offline d'IRIS. DB Browser montre un workflow **Write Changes / Revert Changes** explicite sans auto-save, approprié pour des données de paie sensibles.

### Les 3 patterns les plus transférables pour l'axe 1

**Pattern 1 : Architecture trois panneaux synchronisés** (source : Wireshark, ImHex, 010 Editor). Le panneau supérieur liste toutes les lignes du fichier en tableau synthétique avec colonnes calculées (type d'enregistrement, matricule, montants clés), coloré par type de ligne. Le panneau central affiche les champs de la ligne sélectionnée dans un arbre ou formulaire structuré. Le panneau inférieur montre la ligne brute de 204 caractères avec coloration par champ. La sélection dans n'importe quel panneau se synchronise avec les deux autres.

**Pattern 2 : Segmentation colorée de la vue brute** (source : ImHex, 010 Editor). Dans la vue des 204 caractères, chaque plage positionnelle reçoit une couleur de fond distincte — les champs adjacents alternent les teintes. Un survol affiche une infobulle avec le nom du champ, son type, ses valeurs autorisées et la valeur décodée. Ce pattern transforme une chaîne opaque en structure visible sans compter les caractères.

**Pattern 3 : Basculement grille ↔ formulaire** (source : TablePlus, Beekeeper Studio). L'utilisateur peut passer d'une vue tableur (toutes les lignes, une par rangée, colonnes = champs principaux) à une vue formulaire (une seule ligne, tous les champs affichés verticalement avec labels, types et contraintes). La vue grille sert à la navigation rapide, la vue formulaire à l'édition détaillée.

---

## Axe 2 — Navigation master-detail dans une hiérarchie à 4 niveaux

IRIS structure ses données en quatre niveaux : Fichier → Individu → Cartes → Champs. Ce pattern de navigation hiérarchique est résolu de manières variées par onze applications.

### Les applications de référence

**Windows Registry Editor** (regedit, intégré à Windows) est l'archétype du **split tree + detail** : arbre hiérarchique à gauche (ruches → clés → sous-clés), tableau de valeurs à droite (Name, Type, Data). La barre d'adresse affiche le chemin complet (`HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft`). Le pattern est immédiatement familier aux utilisateurs Windows — un avantage pour les gestionnaires de paie peu techniques. Le séparateur redimensionnable entre les deux panneaux permet d'adapter l'espace à la tâche.

**VS Code** (IDE, multiplateforme, https://code.visualstudio.com/) combine **trois couches de navigation** : le sidebar Explorer (arbre de fichiers), la barre de breadcrumbs au-dessus de l'éditeur (chemin fichier + chemin symbolique, ex. `src > components > App.tsx > render`), et le panneau Outline (arbre des symboles du fichier courant). Chaque segment de breadcrumb est cliquable et ouvre un dropdown des frères à ce niveau. Le **Sticky Scroll** affiche les en-têtes de contexte (classes, fonctions) collés en haut de l'éditeur lors du défilement. Pour IRIS, ce triple système (sidebar fichiers → breadcrumbs individu/carte → panneau de champs) est directement applicable.

**Linear** (gestion de projet, web/desktop, https://linear.app) définit l'état de l'art en **navigation « inverted L-shape »** : sidebar à gauche (workspace, équipes, vues, projets) + barre d'en-tête contextuelle (breadcrumbs, filtres, bascule de layout). Le redesign 2024 a explicitement travaillé la « hiérarchie et densité des éléments de navigation » — le sidebar est visuellement atténué pour que le contenu central reste au premier plan. Le redesign 2026 a encore adouci les bordures : « les éléments centraux à la tâche restent au focus, ceux qui supportent l'orientation doivent s'effacer ». La **palette de commandes Cmd+K** permet une navigation clavier-first. Pour IRIS, ce principe de hiérarchie visuelle (navigation = discret, contenu = saillant) est fondamental.

**Apple Finder en vue colonnes** (macOS, https://developer.apple.com/design/human-interface-guidelines/) utilise les **Miller columns** : chaque niveau hiérarchique est une colonne, sélectionner un élément ouvre ses enfants dans la colonne suivante. Tous les niveaux ancêtres restent visibles à gauche. Avec exactement 4 niveaux, IRIS pourrait afficher simultanément Fichiers | Individus | Cartes | Champs en quatre colonnes — l'utilisateur voit toujours le chemin complet. L'inconvénient est l'exigence en largeur d'écran.

**pgAdmin 4** (administration PostgreSQL, web/desktop, https://www.pgadmin.org/) propose un **arbre profond** (Serveur → Base → Schéma → Table → Colonnes) couplé à des **onglets contextuels** à droite (Properties, SQL, Statistics, Dependencies). Ce pattern d'onglets contextuels est pertinent pour IRIS : au niveau « Carte », des onglets pourraient montrer Champs | Validation | Historique.

**Salesforce Lightning** (CRM, web, https://trailhead.salesforce.com/) apporte le pattern **Record Page à onglets** : un bandeau Record Highlights (champs clés en haut), puis des onglets Details (tous les champs) et Related (entités liées). Les **Dynamic Forms** permettent d'organiser les champs en sections contextuelles par profil utilisateur. Pour IRIS, ce modèle s'applique au niveau Individu : bandeau synthétique (matricule, nom, service) + onglets par catégorie de cartes.

**Figma** (design, web/desktop, https://figma.com), **Notion** (workspace, web/desktop, https://notion.com), **Postman** (API, web/desktop, https://postman.com), **BambooHR** (RH, web, https://bamboohr.com) et **TablePlus** complètent l'analyse avec des variations pertinentes — Figma pour sa synchronisation sélection-panneau, Notion pour ses breadcrumbs tronqués avec « … », Postman pour sa navigation arborescente Collection → Dossier → Requête en tabs, BambooHR pour sa fiche employé à onglets horizontaux (Personal, Job, Time Off, Benefits).

### Les 3 patterns les plus transférables pour l'axe 2

**Pattern 1 : Arbre + panneau détail + breadcrumbs** (source : Registry Editor, pgAdmin, VS Code). Le sidebar gauche affiche l'arbre Fichier → Individus → Cartes avec icônes différenciées par type. Le panneau droit affiche les Champs de la carte sélectionnée en formulaire ou grille éditable. Une barre de breadcrumbs au-dessus du panneau droit montre le chemin complet cliquable (`DADS2024.txt > Dupont Marie > Carte 10 > Zone 042`). Ce pattern est le plus familier aux utilisateurs Windows et le plus validé par les recherches NNGroup sur les hiérarchies à 3+ niveaux.

**Pattern 2 : Navigation « inverted L-shape » avec disclosure progressive** (source : Linear, Salesforce). Le sidebar gère les niveaux 1-2 (fichier, liste d'individus filtrable/cherchable). La barre d'en-tête gère le niveau 3 (cartes sous forme d'onglets ou dropdown). Le contenu central affiche le niveau 4 (champs éditables en sections organisées). Palette Cmd+K pour sauter directement à n'importe quel individu ou champ.

**Pattern 3 : Miller columns pour les 4 niveaux simultanés** (source : Apple Finder). Quatre colonnes affichant Fichiers | Individus | Cartes | Champs — l'utilisateur voit toujours le contexte complet. Réservé aux écrans larges. Pertinent si les utilisateurs naviguent fréquemment entre individus ou cartes sans perdre le contexte.

---

## Axe 3 — Édition sécurisée avec validation temps réel

Dans IRIS, chaque champ a un type strict (numérique, alphanumérique, code), une longueur fixe et des valeurs contraintes. Corrompre le format de 204 caractères doit être impossible. Dix applications résolvent ce problème avec des approches variées.

### Les applications de référence

Le **Monaco Constrained Editor Plugin** (plugin open source pour l'éditeur Monaco, web, https://github.com/Pranomvignesh/constrained-editor-plugin) est **l'application la plus directement pertinente** pour IRIS. Ce plugin définit des plages éditables par coordonnées `[startLine, startColumn, endLine, endColumn]` dans un éditeur de texte. Les zones hors plages sont en lecture seule — les frappes y sont silencieusement ignorées. Chaque plage reçoit une fonction `validate()` personnalisée (ex. : regex `/^[a-z0-9A-Z]*$/`). Les plages s'agrandissent/rétrécissent dynamiquement avec le contenu. Pour IRIS, cela signifie : définir chaque champ de la ligne 204 caractères comme une plage éditable avec validation par type de caractère à chaque position. La corruption du format est **structurellement impossible** — le curseur ne peut éditer que dans les plages autorisées.

**VS Code avec JSON Schema** (IDE, multiplateforme, https://code.visualstudio.com/docs/languages/json) montre la validation pilotée par schéma. Les soulignements ondulés rouges apparaissent en temps réel sous les valeurs invalides. **IntelliSense** suggère les propriétés et valeurs valides avant même que l'utilisateur tape. Le survol d'une erreur affiche un message précis référençant la contrainte violée (ex. : « Value is not accepted. Valid values: 'always', 'never'. »). Le panneau Problems agrège toutes les erreurs. Pour IRIS, ce modèle de schéma déclaratif pilotant autocomplete + validation + messages d'erreur est directement applicable.

**SAP Fiori** (framework UI d'entreprise, web, https://experience.sap.com/fiori-design-web/) apporte trois mécanismes clés. Le **MaskInput** (`sap.m.MaskInput`) impose un format par position — directement analogue aux champs à format fixe d'IRIS. Le **MessagePopover** collecte toutes les erreurs en une liste cliquable ; un clic sur une erreur scrolle jusqu'au champ concerné. Le **mécanisme de brouillon** persiste les données incomplètes ou invalides côté serveur, permettant à l'utilisateur de quitter et revenir plus tard sans perdre son travail — pertinent pour des sessions d'édition de fichiers de paie complexes.

**Excel Data Validation** (tableur, multiplateforme) offre le **modèle à trois niveaux de sévérité** le plus mature : **Stop** (bloque l'entrée, ne laisse pas passer la valeur), **Warning** (avertit mais permet de forcer), **Information** (notifie sans bloquer). L'**Input Message** apparaît quand la cellule est sélectionnée, montrant les contraintes avant toute saisie. La fonction « Circle Invalid Data » entoure les cellules invalides existantes d'ovales rouges. Pour IRIS, ce modèle tripartite est essentiel : certaines contraintes sont absolues (corruption du format = Stop), d'autres sont des règles métier (valeur improbable mais légale = Warning).

Le **framework Qt** (desktop, multiplateforme, documenté sur https://www.ics.com/blog/qts-approach-input-validation-masks-and-validators-explained) introduit le concept crucial de **validation à trois états : Acceptable / Intermediate / Invalid**. L'état Intermediate signifie « pas encore valide, mais pourrait le devenir avec plus de saisie » — un champ numérique de 8 caractères contenant « 123 » est Intermediate, pas Invalid. Cela élimine la **validation prématurée**, identifiée par NNGroup comme un pattern hostile majeur. Pour IRIS, ce modèle résout élégamment le problème d'un champ en cours de saisie qui n'est pas encore complet.

**010 Editor** (hex editor, multiplateforme) démontre l'**édition structurée avec protection du format** : les Binary Templates fournissent des éditeurs typés (éditeur d'entier pour les champs entiers, éditeur de chaîne pour les chaînes). L'utilisateur édite via la vue structurée et les changements se répercutent dans les données brutes. La vue brute reste accessible mais son édition directe est « à vos risques ». Ce dual-mode (édition sûre via formulaire + édition brute avancée) est pertinent pour les trois profils d'utilisateurs d'IRIS.

**DBeaver** (client SQL, multiplateforme, https://dbeaver.com/) apporte le pattern **Generate Script → Preview → Commit** : avant d'enregistrer les modifications, l'outil génère un aperçu du script SQL qui sera exécuté. L'utilisateur vérifie les changements avant de les valider. Pour IRIS, cela signifie montrer la ligne de 204 caractères modifiée avec les changements surlignés avant d'écrire le fichier.

Le **USWDS Input Mask** (design system gouvernemental américain, web, https://designsystem.digital.gov/components/input-mask/) montre un masque positionnel où seuls les caractères valides sont acceptés à chaque position, les séparateurs sont insérés automatiquement, et le placeholder montre le format attendu. Directement applicable aux champs à format fixe d'IRIS.

### Les 3 patterns les plus transférables pour l'axe 3

**Pattern 1 : Édition contrainte par plage avec validation par champ** (source : Monaco Constrained Editor, 010 Editor). Chaque champ de la ligne 204 caractères est une plage éditable `[colDébut, colFin]` avec fonction de validation personnalisée. Les séparateurs structurels et indicateurs de type d'enregistrement sont en lecture seule. Les frappes invalides sont silencieusement rejetées. La corruption est impossible par design.

**Pattern 2 : Validation à trois états Acceptable/Intermediate/Invalid** (source : Qt, Excel, NNGroup). Au lieu d'un binaire valide/invalide, trois états visuels distincts : vert (complet et valide), neutre/ambre (en cours de saisie, pourrait devenir valide), rouge (ne peut pas devenir valide). Combiné avec le modèle de sévérité d'Excel (Stop/Warning/Info) pour distinguer contraintes de format absolues et règles métier assouplissables.

**Pattern 3 : Communication des contraintes avant-pendant-après + aperçu avant commit** (source : SAP Fiori, DBeaver, USWDS). Avant la saisie : afficher type, longueur, valeurs autorisées près du champ. Pendant la saisie : masque positionnel, restriction de caractères, indicateur de progression (« 3/8 caractères »). Après l'édition : aperçu de la ligne complète de 204 caractères avec modifications surlignées et liste navigable d'erreurs restantes (MessagePopover de SAP Fiori).

---

## Axe 4 — Comparaison côte à côte de fichiers de paie

La comparaison multi-fichiers d'IRIS (ex. : comparer deux campagnes de paie mensuelles pour identifier les écarts) s'appuie sur des patterns éprouvés par onze outils de diff.

### Les applications de référence

**Beyond Compare** (outil de diff commercial, multiplateforme, https://www.scootersoftware.com) est la référence la plus pertinente grâce à son **Table Compare**. Ce mode compare des données tabulaires (CSV, Excel, HTML) **cellule par cellule** dans une grille, avec alignement sur des **colonnes-clés définies par l'utilisateur** (équivalent de clés primaires). Les colonnes non importantes peuvent être ignorées. Les cellules différentes sont colorées individuellement. Une **tolérance numérique** permet d'ignorer les écarts en dessous d'un seuil — essentiel pour les arrondis de calcul de paie. En comparaison textuelle, les lignes modifiées ont un fond rose pâle et les caractères différents sont en rouge foncé. Le **score de similarité** par ligne (pas juste égal/différent) permet de matcher des contenus réorganisés.

**Kaleidoscope** (outil de diff premium, macOS uniquement, https://kaleidoscope.app/) introduit le **double encodage couleur + symbole** : rouge avec `−` pour les suppressions, vert avec `+` pour les ajouts, bleu avec `~` pour les modifications, `!` pour les conflits. Cette **redondance améliore l'accessibilité** pour les daltoniens — critique pour un outil administratif utilisé par un large public de la fonction publique. Les **Text Filters** masquent les différences non pertinentes (horodatages, UUID) via regex — adaptable en « filtres par type de champ » pour IRIS. Les **régions inchangées se replient** pour concentrer l'attention sur les écarts.

**VS Code Diff Editor** (IDE, multiplateforme, https://code.visualstudio.com) offre la **bascule inline ↔ côte-à-côte** la plus fluide. Le fond rouge avec hachures diagonales sur le côté opposé signale les suppressions ; le vert avec hachures signale les ajouts. Le **minimap** montre les décorations de diff pour une vue d'ensemble. La touche **F7/Shift+F7** navigue entre différences. L'option **Collapse Unchanged Regions** masque le contenu identique. L'**ignorance d'espaces** est configurable.

**DiffEngineX** (comparaison de tableurs, Windows, https://www.florencesoft.com/) est hautement pertinent pour IRIS car il compare des **classeurs Excel cellule par cellule** avec alignement sur colonnes-clés. Il génère un **rapport de différences avec hyperliens** qui pointent directement vers les cellules modifiées dans les copies annotées. L'option **« Hide matching rows »** ne montre que les différences avec N lignes de contexte — exactement le workflow nécessaire pour comparer des centaines de fiches de paie. La **tolérance numérique** (seuil absolu ou pourcentage) et la **comparaison de formules vs valeurs calculées** ajoutent de la finesse.

**Datafold Data Diff** (comparaison de datasets, cloud/CLI, https://www.datafold.com/data-diff) apporte le workflow **résumé statistique → drill-down progressif**. L'interface montre d'abord les métriques de haut niveau (pourcentage de lignes identiques, répartition par colonne), puis permet de descendre vers les lignes spécifiquement différentes. Pour IRIS, ce pattern signifie : d'abord afficher « 847 enregistrements identiques, 23 modifiés, 5 nouveaux, 2 supprimés », puis permettre le drill-down.

**WinMerge** (diff open source, Windows, https://winmerge.org/) apporte un **minimap latéral** montrant une vue condensée de tout le fichier avec les changements marqués, permettant un saut direct vers n'importe quelle zone. **Meld** (diff open source, Linux, https://meldmerge.org/) utilise des **lignes courbes** reliant les sections correspondantes entre les panneaux plutôt que l'alignement par blocs vides. **Sublime Merge** (client Git, multiplateforme, https://www.sublimemerge.com/) permet d'**étendre le contexte** interactivement en glissant les bords d'un hunk. **SemanticDiff** (diff structuré, web/VS Code, https://semanticdiff.com/) comprend la **structure sémantique** des données et filtre les changements de formatage pour ne montrer que les modifications significatives.

### Les 3 patterns les plus transférables pour l'axe 4

**Pattern 1 : Comparaison tabulaire alignée sur clés primaires** (source : Beyond Compare Table Compare, DiffEngineX). Les enregistrements des deux fichiers sont alignés par matricule (ou identifiant d'enregistrement). La comparaison est cellule par cellule, champ par champ. Les cellules différentes sont colorées. Les colonnes non pertinentes peuvent être masquées. Une tolérance numérique filtre les écarts d'arrondi.

**Pattern 2 : Résumé statistique → drill-down progressif** (source : Datafold, DiffEngineX). Un tableau de bord affiche d'abord : total d'enregistrements, enregistrements identiques, modifiés, nouveaux, supprimés — avec ventilation par type de champ. Un clic sur chaque catégorie affiche les enregistrements concernés. Des filtres par type de changement et type de champ permettent de cibler l'analyse.

**Pattern 3 : Double encodage couleur + symbole avec repli des zones inchangées** (source : Kaleidoscope, VS Code). Fonds colorés (vert/rouge/bleu) **et** icônes (`+`/`−`/`~`) dans une colonne de marge. Minimap latéral montrant la densité des changements. Zones inchangées repliables. Filtres par type de champ (« montrer uniquement les changements sur les champs de rémunération »).

---

## Matrice de correspondance applications × axes UX

|Application|Axe 1 — Visualisation dense|Axe 2 — Navigation hiérarchique|Axe 3 — Édition validée|Axe 4 — Comparaison|
|---|:-:|:-:|:-:|:-:|
|**Wireshark**|★★★|★★|||
|**ImHex**|★★★||||
|**010 Editor**|★★★||★★||
|**VS Code**||★★★|★★|★★★|
|**Beyond Compare**||||★★★|
|**TablePlus**|★★|★★|||
|**Linear**||★★★|||
|**Kaleidoscope**||||★★★|
|**Monaco Constrained Editor**|||★★★||
|**SAP Fiori**|||★★★||
|**Excel Data Validation**|||★★★||
|**DiffEngineX**||||★★★|
|**Beekeeper Studio**|★★||★||
|**pgAdmin**||★★★|||
|**Datafold**||||★★|
|**Kaitai Struct**|★★||||
|**Qt Framework**|||★★||
|**USWDS Input Mask**|||★★||
|**DBeaver**|||★★||
|**JSON Crack**|★★||||
|**DB Browser for SQLite**|★★||★||
|**Salesforce Lightning**||★★|||
|**Notion**||★★|||
|**Figma**||★★|||
|**WinMerge**||||★★|
|**Meld**||||★★|
|**SemanticDiff**||||★★|
|**BambooHR**||★★|||
|**Registry Editor (regedit)**||★★|||
|**Apple Finder (colonnes)**||★★|||

★★★ = Référence majeure pour cet axe — pattern directement transférable  
★★ = Contribution significative — techniques spécifiques utiles  
★ = Contribution mineure mais pertinente

---

## Recommandations de design pour IRIS, par priorité

### Priorité 1 — Fondations architecturales (à implémenter en premier)

**R1. Architecture trois panneaux synchronisés** pour la vue principale. Le panneau supérieur liste toutes les lignes du fichier (une ligne = une rangée) avec colonnes synthétiques : type d'enregistrement, matricule, nom, montants clés. Lignes colorées par type (en-tête = bleu, détail = blanc, pied = gris). Le panneau central affiche les champs de la ligne sélectionnée dans un formulaire structuré ou arbre. Le panneau inférieur montre la ligne brute de 204 caractères avec segmentation colorée par champ. **Synchronisation bidirectionnelle entre les trois panneaux** — cliquer dans l'un met à jour les deux autres. _Sources : Wireshark, ImHex, 010 Editor._

**R2. Navigation arbre + breadcrumbs** pour la hiérarchie Fichier → Individu → Carte → Champ. Le sidebar gauche affiche l'arbre avec icônes différenciées. Une barre de breadcrumbs au-dessus du panneau central affiche le chemin complet cliquable. Chaque segment de breadcrumb ouvre un dropdown des éléments frères (comme VS Code). Palette Cmd+K pour sauter à n'importe quel individu par nom ou matricule. _Sources : VS Code, pgAdmin, Linear._

**R3. Édition contrainte par plage avec validation trois états.** Chaque champ est une plage éditable avec coordonnées fixes. Les zones structurelles (délimiteurs, indicateurs de type) sont en lecture seule — les frappes y sont ignorées. Chaque plage a une fonction de validation retournant Acceptable (vert), Intermediate (neutre) ou Invalid (rouge). Les frappes de caractères invalides pour le type sont silencieusement rejetées. _Sources : Monaco Constrained Editor Plugin, Qt, 010 Editor._

### Priorité 2 — Expérience d'édition et de sécurité

**R4. Modèle de sévérité tripartite Stop/Warning/Info.** Les contraintes de format (type de caractère, longueur de champ) sont des Stop — l'entrée est bloquée. Les contraintes de valeur métier (code improbable mais techniquement valide) sont des Warning — un avertissement apparaît mais l'entrée est autorisée avec confirmation. Les informations contextuelles (valeur inhabituelle mais sans risque) sont des Info. _Source : Excel Data Validation._

**R5. Workflow « aperçu avant commit ».** Les modifications s'accumulent comme des changements pendants, visualisés dans un style code-review (ancien → nouveau, vert/rouge). Un compteur de modifications pendantes est visible en permanence. Le bouton « Enregistrer » ouvre d'abord un aperçu montrant chaque ligne modifiée avec les champs changés surlignés. Boutons explicites « Écrire les changements » et « Annuler tout ». Pas d'auto-save. _Sources : TablePlus, DB Browser for SQLite, DBeaver._

**R6. Communication des contraintes avant-pendant-après.** Avant : chaque champ affiche en label permanent son nom, type, longueur et positions (`NOM | Alpha | 30 car. | pos. 45-74`). Pendant : masque positionnel, indicateur de progression (`3/8`), restriction de caractères. Après édition : MessagePopover avec liste navigable de toutes les erreurs restantes — clic sur une erreur scrolle au champ. _Sources : SAP Fiori, USWDS Input Mask, NNGroup._

### Priorité 3 — Comparaison multi-fichiers

**R7. Comparaison tabulaire alignée par identifiant.** Les enregistrements des deux fichiers sont appariés par matricule ou identifiant. La comparaison est champ par champ dans une grille. Les cellules différentes sont colorées (vert = ajout, rouge = suppression, bleu = modification). Tolérance numérique configurable pour les montants. Colonnes masquables pour filtrer le bruit. _Sources : Beyond Compare Table Compare, DiffEngineX._

**R8. Tableau de bord de comparaison avec drill-down.** Avant le détail : afficher un résumé (nombre d'enregistrements identiques, modifiés, nouveaux, supprimés, répartition par type de champ). Clic sur chaque catégorie pour voir les enregistrements concernés. Filtres par type de changement et type de champ. _Sources : Datafold, DiffEngineX._

**R9. Double encodage couleur + symbole et repli des zones inchangées.** Utiliser couleurs **et** icônes pour chaque type de changement (accessibilité daltoniens). Minimap latéral montrant la densité des changements. Zones inchangées repliables. Navigation Suivant/Précédent entre différences avec compteur. _Sources : Kaleidoscope, VS Code Diff Editor._

### Priorité 4 — Raffinements pour les trois profils d'utilisateurs

**R10. Double mode grille/formulaire adapté au profil.** Vue grille (tableur) par défaut pour les développeurs et chefs de projet — dense, rapide, navigation clavier. Vue formulaire par défaut pour les gestionnaires de paie — un individu à la fois, champs labellisés, validation visuelle claire. Basculement instantané entre les deux. _Sources : TablePlus, Beekeeper Studio._

**R11. Chrome de couleur par contexte de fichier.** L'interface adopte une teinte globale selon le type de fichier : production = bordure rouge, recette = bordure orange, test = bordure verte. Visible en permanence, empêche les erreurs d'environnement. _Source : Beekeeper Studio._

**R12. Champs calculés et valeurs décodées entre crochets.** À côté des valeurs brutes, afficher les valeurs décodées et calculées entre crochets ou dans une colonne dédiée : code « 01 » → `[Traitement indiciaire]`, positions 45-52 contenant « 00234567 » → `[2 345,67 €]`. Montrer les totaux calculés, statuts de validation, et cross-références non présents dans les données brutes. _Source : Wireshark (champs générés)._

---

## Conclusion : un langage UX composite inédit

IRIS se situe à l'intersection de quatre traditions UX qui n'ont jamais été combinées dans un seul outil. Les hex editors (ImHex, 010 Editor) ont résolu le problème du « format opaque rendu lisible ». Les outils de gestion de projet et IDE (Linear, VS Code) ont perfectionné la navigation hiérarchique dense. Les frameworks d'entreprise (SAP Fiori, Excel) ont codifié la validation contrainte pour données critiques. Les outils de diff (Beyond Compare, Kaleidoscope) ont optimisé la perception visuelle des différences.

La recommandation architecturale la plus importante est **l'architecture trois panneaux synchronisés** héritée de Wireshark — c'est le pattern qui donne à IRIS son identité fondamentale et qui résout le problème central de la traduction brut → structuré. La deuxième priorité est la **segmentation colorée de la vue brute** issue d'ImHex — le pattern qui rend les 204 caractères instantanément compréhensibles. La troisième est la **comparaison tabulaire alignée sur clés** de Beyond Compare — le pattern qui transforme la comparaison de fichiers de paie d'une tâche artisanale en un processus systématique.

Un insight non trivial émerge de cette recherche : les applications les plus réussies dans chaque axe ne sont pas celles qui ont le plus de fonctionnalités, mais celles qui ont la **correspondance la plus forte entre la structure des données et la structure de l'interface**. Wireshark ne « montre » pas les paquets — sa hiérarchie visuelle _est_ la hiérarchie protocolaire. ImHex ne « décore » pas les octets — les couleurs _sont_ la structure. IRIS devrait suivre ce principe : l'interface ne devrait pas représenter le format de 204 caractères, elle devrait _être_ ce format, rendu visible et manipulable.
