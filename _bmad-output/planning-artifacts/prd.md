---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['iris/ANALYSE_IRIS.md']
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 1
workflowType: 'prd'
classification:
  projectType: desktop_app
  domain: govtech
  complexity: high
  projectContext: brownfield
  security: authentication + user data isolation (no RBAC)
---

# Product Requirements Document - IRIS

**Author:** Negus
**Date:** 2026-03-22

## Résumé Exécutif

IRIS est le premier éditeur dédié aux fichiers au format GEST — le format à largeur fixe (204 caractères/ligne) utilisé dans l'administration française pour le traitement de la paie publique. Aujourd'hui, aucun outil spécialisé n'existe : gestionnaires de paie, DRH, chefs de projet et développeurs de logiciels de paie manipulent ces fichiers dans des éditeurs de texte brut, rendant la lecture, la modification et la comparaison laborieuses et sujettes à erreur.

IRIS transforme ce format opaque en données structurées, lisibles et éditables. L'application permet l'import, la visualisation intelligente, la modification sécurisée, la comparaison et l'export de fichiers GEST. Elle intègre une authentification utilisateur et un cloisonnement des données pour protéger les informations sensibles de paie (conformité RGPD).

Ce produit est une refonte complète d'un prototype existant (v0.1.5) déjà utilisé en production par un éditeur de logiciel de paie/RH pour valider les migrations de données.

### Ce qui rend ce produit spécial

- **Aucun concurrent** — IRIS comble un vide total sur le marché des outils GEST. Il n'existe aucune alternative dédiée.
- **Compréhension native du format** — L'outil décode les 31 types de cartes GEST, exposant chaque champ avec son libellé et sa position, là où les utilisateurs ne voient que 204 caractères bruts.
- **Édition sécurisée** — Modification des champs avec validation de la structure, éliminant le risque de corrompre le fichier par une édition manuelle.
- **Validation terrain** — Le cœur de comparaison est déjà éprouvé en usage réel pour la validation de mises en production.

## Classification du Projet

| Critère | Valeur |
|---------|--------|
| **Type** | Application Desktop (Tauri) |
| **Domaine** | GovTech / Paie publique |
| **Complexité** | Élevée (données sensibles, RGPD, format métier spécifique) |
| **Contexte** | Brownfield (refonte complète du prototype IRIS v0.1.5) |
| **Sécurité** | Authentification + isolation des données par utilisateur |
| **Plateforme MVP** | Windows |

## Critères de Succès

### Succès Utilisateur

- **Temps de compréhension réduit de 60x** — Passer de ~1 minute par donnée (comptage manuel de caractères) à une compréhension immédiate grâce à l'affichage structuré des cartes GEST avec libellés et champs décodés.
- **Workflow complet en 30 secondes** — Lancer l'application, importer un fichier GEST, visualiser, modifier un champ et exporter — le tout en moins de 30 secondes.
- **Zéro corruption** — Aucune modification ne produit un fichier GEST invalide. L'utilisateur édite en confiance sans risquer de casser la structure à largeur fixe.
- **Moment "aha"** — À la première ouverture d'un fichier GEST, l'utilisateur voit instantanément les cartes décodées, structurées et lisibles — là où il ne voyait que 204 caractères bruts.

### Succès Business

- **3 mois** — MVP fonctionnel adopté en interne par l'entreprise (éditeur de logiciel paie/RH) pour remplacer l'usage des éditeurs de texte brut.
- **12 mois** — Adoption par les clients de l'entreprise + accessibilité au public. Produit suffisamment mature pour envisager une commercialisation.
- **Modèle** — Projet personnel accessible gratuitement pour le moment, avec potentiel de vente/licence à l'entreprise pour distribution commerciale. Sert également de vitrine portfolio pour l'agence digitale de Negus (preuve de compétences en applications desktop).

### Succès Technique

- **Performance optimale** — Import, parsing et comparaison de fichiers GEST volumineux (plusieurs milliers de lignes) dans des délais rapides. Édition fluide. *(Voir NFR1-NFR6 pour les cibles détaillées.)*
- **Sécurité des données sensibles** — Données de paie (RIB, INSEE, informations personnelles) chiffrées au repos, inaccessibles sans authentification. *(Voir NFR7-NFR12 pour les exigences détaillées.)*
- **Conformité RGPD** — Cloisonnement strict des données par utilisateur, aucune donnée en clair sur le disque.

### Résultats Mesurables

| Métrique | Cible |
|----------|-------|
| Temps d'import + visualisation d'un fichier GEST | < 5 secondes |
| Temps de compréhension d'une carte | Immédiat (vs ~1 min aujourd'hui) |
| Workflow complet (import → modification → export) | < 30 secondes |
| Fichiers GEST corrompus après édition | 0% |
| Données sensibles accessibles sans authentification | 0 |

## Parcours Utilisateurs

### 1. Sophie — Gestionnaire de paie (Visualisation + Modification)

**Situation :** Sophie est gestionnaire de paie dans une administration départementale. Elle reçoit un fichier GEST à contrôler et corriger avant l'envoi pour le traitement de la paie mensuelle.

**Aujourd'hui :** Elle ouvre le fichier dans Notepad++, voit 2000 lignes de 204 caractères. Pour vérifier un RIB, elle doit compter manuellement les positions de caractères, croiser avec la documentation papier du format GEST. Trouver et comprendre une donnée prend environ 1 minute. Modifier un champ est risqué — un caractère de trop et le fichier est rejeté.

**Avec IRIS :**
- **Ouverture** — Sophie lance IRIS, s'authentifie. Elle importe le fichier GEST. En 2 secondes, le rapport de validation s'affiche : 1 987 lignes OK, 3 lignes KO (longueur incorrecte).
- **Découverte** — Elle voit immédiatement l'en-tête de bande décodé (ministère, date de paye, chaîne) et la liste des cartes classées par individu. Chaque champ a son libellé clair.
- **Action** — Elle navigue jusqu'à l'individu concerné, repère la Carte 40 avec le RIB erroné. Le champ est surligné, elle le corrige directement dans le formulaire d'édition. IRIS valide automatiquement la longueur et la structure.
- **Résolution** — Elle exporte le fichier GEST corrigé, prêt pour envoi. Workflow complet : 30 secondes.

**Capacités révélées :** Import avec validation, visualisation structurée par individu, navigation par type de carte, édition de champs avec validation, export GEST.

---

### 2. Marc — Chef de projet logiciel de paie (Comparaison de migration)

**Situation :** Marc est chef de projet chez un éditeur de logiciel de paie/RH. Son équipe migre le moteur de calcul de WinPaie+RH. Il doit valider que les fichiers GEST produits après migration sont identiques à ceux de référence.

**Aujourd'hui :** Il utilise le prototype IRIS v0.1.5 pour comparer, mais ne peut pas visualiser en détail les écarts ni comprendre facilement les différences détectées.

**Avec IRIS :**
- **Préparation** — Marc s'authentifie, importe le fichier GEST de référence (production actuelle) et le fichier GEST cible (nouvelle version du moteur).
- **Comparaison** — Il lance la comparaison. IRIS apparie les cartes par individu et type, détecte 47 différences : 12 écarts de valeur sur des Cartes 05, 3 cartes orphelines en référence, 2 cartes orphelines en comparaison.
- **Analyse** — Il visualise chaque différence avec le champ concerné, la valeur de référence et la valeur comparée côte à côte. Il identifie rapidement que les 12 écarts sont liés à un arrondi de montant sur le code indemnité 0412.
- **Décision** — Il exporte le rapport de comparaison en Excel pour le partager avec l'équipe de développement. La mise en production est validée ou reportée selon les résultats.

**Capacités révélées :** Import multi-fichiers, moteur de comparaison avec appariement par clés, affichage des différences champ par champ, export des résultats de comparaison.

---

### 3. Karim — Développeur logiciel de paie (Debug / Investigation)

**Situation :** Karim est développeur chez le même éditeur. Un bug est remonté : le fichier GEST généré par WinPaie:PreliQ contient des anomalies sur les cartes de type 22 pour certains agents.

**Aujourd'hui :** Il ouvre le fichier GEST brut, cherche manuellement les lignes avec le code carte "22", compte les positions pour isoler les champs codeIndemnite, numero et sens. C'est fastidieux et source d'erreurs d'interprétation.

**Avec IRIS :**
- **Import** — Karim s'authentifie, importe le fichier GEST problématique. Le rapport de validation est propre.
- **Investigation** — Il filtre l'affichage sur les Cartes 22. Immédiatement, il voit tous les champs décodés : codeIndemnite, numero, sens, montant. Il repère que le champ "sens" contient une valeur inattendue ("3" au lieu de "1" ou "2") pour 15 agents.
- **Vérification** — Il compare avec un fichier GEST de référence pour confirmer la régression. La comparaison confirme que ces Cartes 22 divergent uniquement sur le champ "sens".
- **Correction** — Il a identifié le bug en 2 minutes. Il peut même modifier les valeurs directement dans IRIS et exporter un fichier GEST corrigé en attendant le fix dans le logiciel.

**Capacités révélées :** Filtrage par type de carte, visualisation détaillée des champs spécifiques, comparaison ciblée, modification rapide pour correction ponctuelle.

---

### 4. Amélie — Nouvel utilisateur (Première connexion)

**Situation :** Amélie, nouvelle gestionnaire, doit utiliser IRIS pour la première fois.

**Avec IRIS :**
- **Inscription** — Elle crée son compte avec ses identifiants. L'authentification est simple et rapide.
- **Première prise en main** — L'interface est claire : les actions principales (Importer, Visualiser, Comparer, Exporter) sont visibles. Elle importe son premier fichier GEST.
- **Découverte** — Elle découvre que le fichier qu'elle ouvrait dans un éditeur texte est maintenant lisible : en-tête de bande décodé, cartes structurées avec des libellés compréhensibles. Elle navigue naturellement entre les individus et les types de cartes.
- **Confiance** — Ses données sont cloisonnées — elle ne voit que ses propres fichiers. Les données sensibles sont protégées.

**Capacités révélées :** Création de compte, authentification, onboarding intuitif, interface auto-explicative, cloisonnement des données.

---

### Résumé des Capacités par Parcours

| Capacité | Sophie | Marc | Karim | Amélie |
|----------|--------|------|-------|--------|
| Authentification & cloisonnement | ✓ | ✓ | ✓ | ✓ |
| Import avec validation | ✓ | ✓ | ✓ | ✓ |
| Visualisation structurée des cartes | ✓ | | ✓ | ✓ |
| Navigation par individu / type de carte | ✓ | | ✓ | ✓ |
| Édition de champs avec validation | ✓ | | ✓ | |
| Comparaison multi-fichiers | | ✓ | ✓ | |
| Affichage des différences champ par champ | | ✓ | ✓ | |
| Export GEST modifié | ✓ | | ✓ | |
| Export rapport de comparaison | | ✓ | | |
| Filtrage par type de carte | | | ✓ | |

## Exigences Spécifiques au Domaine

### Conformité & Réglementation

- **RGPD — Chiffrement au repos** — Toutes les données stockées en base SQLite doivent être chiffrées. Aucune donnée sensible (RIB, INSEE, données de paie) ne doit être lisible sur le disque sans authentification dans l'application.
- **Données inaccessibles après fermeture** — Une fois l'application fermée, les données en base ne doivent pas être accessibles en clair, même par inspection directe du fichier SQLite.
- **Responsabilité limitée à l'application** — L'export produit un fichier GEST standard. La sécurisation du fichier exporté (stockage, envoi) n'est pas du périmètre d'IRIS.
- **Authentification simple** — Pas de gestion d'habilitations par contexte administratif. L'authentification protège l'accès aux données sauvegardées par utilisateur.

### Contraintes Techniques

- **Base de données SQLite locale** — Stockage exclusivement local, pas de serveur distant. Implique l'utilisation de SQLite chiffré (ex: SQLCipher ou équivalent) pour garantir le chiffrement au repos.
- **Encodage Windows-1252** — Les fichiers GEST utilisent un encodage non-UTF8 (Windows-1252). L'import doit détecter et gérer cet encodage. L'export doit restituer le fichier dans son encodage d'origine pour garantir la compatibilité avec les systèmes de traitement de paie.
- **Intégrité du format** — Chaque ligne doit rester strictement à 204 caractères après modification. Validation systématique avant export.

### Risques et Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Corruption silencieuse après modification** | Fichier GEST invalide envoyé en paie → erreurs de traitement | Validation multi-niveaux avant export : (1) longueur de ligne = 204 caractères, (2) encodage Windows-1252 valide, (3) validation du schéma par type de carte — chaque ligne est validée contre le schéma spécifique de son type de carte (positions, formats, valeurs autorisées des champs). Rapport de validation obligatoire. |
| **Fuite de données via la BDD locale** | Données personnelles et RIB accessibles en clair sur le disque | Chiffrement SQLite (SQLCipher). Données inaccessibles sans authentification dans l'application. |
| **Perte d'encodage à l'export** | Fichier GEST rejeté par les systèmes de traitement de paie | Préservation de l'encodage d'origine (Windows-1252). Validation de l'encodage à l'export. |
| **Modification de champs avec valeurs invalides** | Données métier incohérentes | Validation en temps réel à l'édition selon le schéma du type de carte concerné (format, longueur, valeurs autorisées par champ). Empêcher la saisie de valeurs non conformes au schéma. |

## Innovation & Positionnement Marché

### Zones d'Innovation

- **Création de catégorie** — IRIS crée une catégorie d'outil qui n'existe pas. Le format GEST est utilisé massivement dans la paie publique française, mais aucun outil dédié à sa lecture, édition et comparaison n'a jamais été développé.
- **Spécialisation extrême** — Contrairement aux éditeurs de fichiers à largeur fixe génériques, IRIS embarque une connaissance native des 31 types de cartes GEST, de leurs schémas et de leur sémantique métier.

### Paysage Concurrentiel

- **Aucun concurrent direct** — Pas d'outil dédié au format GEST sur le marché.
- **Alternatives actuelles** — Notepad++, éditeurs de texte brut, Excel pour des analyses manuelles. Aucun ne décode le format.
- **Validation terrain** — Le prototype v0.1.5 est utilisé en production chez un éditeur de logiciel de paie/RH. Pas de retours d'autres acteurs du secteur à ce stade.
- **Marché de niche** — Cible précise (paie publique française) mais avec un besoin réel et non adressé.

### Approche de Validation

- **Phase 1** — Adoption interne par l'entreprise et ses clients comme preuve de valeur.
- **Phase 2** — Mise à disposition publique gratuite pour valider le besoin au-delà du cercle connu.
- **Indicateur clé** — Adoption spontanée par des utilisateurs hors de l'entreprise.

### Risques Innovation

- **Évolution du format GEST** — Probabilité faible. Le format évolue par ajouts/modifications mineures de cartes. Mitigation : architecture basée sur des schémas déclaratifs par type de carte → mise à jour facile.
- Les risques marché et ressources sont détaillés dans la section *Scoping Projet & Développement Phasé > Stratégie de Mitigation des Risques*.

## Exigences Spécifiques Application Desktop

### Vue d'ensemble

IRIS est une application desktop native construite avec Tauri, ciblant principalement l'environnement Windows des administrations françaises. L'application est 100% locale : authentification locale, base de données SQLite chiffrée, aucune dépendance réseau.

### Support Plateformes

| Plateforme | Phase | Priorité |
|------------|-------|----------|
| **Windows** | MVP | Haute — Cible principale (environnement administration) |
| **Linux** | Post-MVP | Moyenne |
| **macOS** | Post-MVP | Moyenne |

### Intégration Système

- **Glisser-déposer** — Support du drag & drop de fichiers GEST depuis l'explorateur de fichiers vers l'application pour l'import.
- **Filesystem** — Lecture de fichiers GEST (import), écriture de fichiers GEST modifiés et rapports Excel (export) via les boîtes de dialogue natives Tauri.
- **Pas d'association de fichiers** ni d'intégration registre Windows pour le MVP.

### Stratégie de Mise à Jour

- **MVP** — Distribution manuelle (installeur classique). Pas d'auto-update.
- **Post-MVP** — Mise à jour automatique intégrée à envisager.

### Authentification

- **MVP** — Authentification locale uniquement (credentials stockés dans la BDD SQLite chiffrée).
- **Post-MVP** — SSO / LDAP si le besoin se confirme.

### Considérations d'Implémentation

- **Tauri** comme framework desktop (Rust backend + webview frontend) — déjà utilisé dans le prototype, à conserver ou mettre à jour vers la dernière version.
- **Performance** — Le traitement des fichiers GEST (parsing, validation, comparaison) doit exploiter les capacités natives pour les fichiers volumineux. Évaluer si la logique métier doit migrer côté Rust, contrairement au prototype où tout est côté client JS.
- **Sécurité mémoire** — Les données sensibles en mémoire doivent être nettoyées à la fermeture de l'application.

## Scoping Projet & Développement Phasé

### Stratégie & Philosophie MVP

**Approche MVP :** Problem-solving — Livrer un outil immédiatement utilisable qui remplace l'usage des éditeurs de texte brut pour les fichiers GEST. Pas de démo, pas de prototype : un produit fonctionnel dès la v1.

**Ressources :** Développeur solo (Negus). Le scope MVP doit rester réalisable par une seule personne.

### Fonctionnalités MVP (Phase 1)

**Parcours utilisateurs supportés :**
- Sophie (gestionnaire) — Workflow complet : import → visualisation → modification → export
- Marc (chef de projet) — Comparaison de fichiers GEST avec export des résultats
- Karim (développeur) — Investigation et debug avec filtrage par type de carte
- Amélie (nouvel utilisateur) — Inscription, authentification, première prise en main

**Capacités indispensables :**

| # | Capacité | Justification |
|---|----------|---------------|
| 1 | **Authentification locale** | Prérequis sécurité — protège l'accès aux données sensibles |
| 2 | **Import & Analyse** | Point d'entrée obligatoire — validation multi-niveaux (longueur, encodage, schéma par type de carte) |
| 3 | **Visualisation structurée** | Cœur de la proposition de valeur — décodage des 31 types de cartes avec libellés |
| 4 | **Modification avec validation** | Différenciateur clé — édition sécurisée sans risque de corruption |
| 5 | **Comparaison** | Fonctionnalité éprouvée du prototype — reprise et amélioration |
| 6 | **Export** | Boucle complète — fichiers GEST modifiés + rapports de comparaison Excel |
| 7 | **Persistance chiffrée (SQLite)** | Conformité RGPD — données sensibles chiffrées au repos |

### Fonctionnalités Post-MVP

**Phase 2 (Croissance) :**
- Recherche avancée (par INSEE, NUDOS, type de carte, valeur de champ)
- Gestion de profils utilisateurs si le besoin se confirme
- Intégration WinPaie+RH et WinPaie:PreliQ pour récupération directe des fichiers GEST
- Pointage des lignes de fichiers GEST
- Export avec filtres et tris
- Support Linux et macOS
- Mise à jour automatique

**Phase 3 (Expansion) :**
- Distribution commerciale via l'entreprise
- Mode multi-utilisateur avec partage de fichiers
- SSO / LDAP
- Détection automatique d'anomalies dans les bandes GEST

### Stratégie de Mitigation des Risques

**Risques techniques :**
- **Chiffrement SQLite** — Complexité d'intégration de SQLCipher avec Tauri/Rust. Mitigation : prototyper l'intégration chiffrement en premier pour valider la faisabilité avant de développer les fonctionnalités métier.
- **Logique métier côté Rust** — Évaluer si le parsing/validation/comparaison doit migrer de JS vers Rust. Mitigation : commencer avec la logique côté frontend (comme le prototype) et migrer vers Rust uniquement si les performances l'exigent sur de gros fichiers.

**Risques marché :**
- Pas de validation externe au-delà de l'entreprise. Mitigation : le logiciel sera accessible **gratuitement pour le moment**, éliminant la barrière à l'adoption. MVP utilisable en production → adoption interne → mise à disposition publique gratuite → feedback et validation par l'usage. La monétisation pourra être envisagée une fois le produit validé par le marché.
- **Vitrine portfolio** — IRIS servira également de projet de référence sur le portfolio de l'agence digitale de Negus, comme preuve de compétences en développement d'applications desktop. Cela renforce l'exigence de qualité technique et d'UX soignée dès le MVP.

**Risques ressources :**
- Développeur solo. Mitigation : le scope MVP est ambitieux mais chaque fonctionnalité est essentielle. Pas de fonctionnalité "nice-to-have" dans le MVP. En cas de contrainte temps, la comparaison (déjà éprouvée) peut être portée en dernier car le cœur différenciant est la visualisation + édition.

## Exigences Fonctionnelles

### Gestion des Utilisateurs

- **FR1:** L'utilisateur peut créer un compte avec des identifiants locaux
- **FR2:** L'utilisateur peut s'authentifier pour accéder à l'application
- **FR3:** L'utilisateur peut uniquement accéder à ses propres données (cloisonnement)
- **FR4:** L'utilisateur peut se déconnecter de l'application

### Import & Analyse de Fichiers GEST

- **FR5:** L'utilisateur peut importer un fichier GEST depuis le système de fichiers via une boîte de dialogue
- **FR6:** L'utilisateur peut importer un fichier GEST par glisser-déposer dans l'application
- **FR7:** Le système valide chaque ligne importée sur sa longueur (204 caractères)
- **FR8:** Le système valide l'encodage du fichier importé (Windows-1252)
- **FR9:** Le système valide chaque ligne contre le schéma spécifique de son type de carte (positions, formats, valeurs)
- **FR10:** L'utilisateur peut consulter un rapport de validation après import (lignes OK, lignes KO, détail des erreurs)
- **FR11:** Le système décode l'en-tête de bande GEST (code correspondance, date de paye, chaîne, ministère, administration, département)
- **FR12:** Le système identifie et classe les cartes par type parmi les 31 types supportés

### Gestion des Bandes GEST Importées

- **FR44:** L'utilisateur peut supprimer une bande GEST importée, ce qui supprime définitivement toutes les données associées (lignes brutes, champs décodés, résultats de comparaison) de la base de données

### Visualisation des Bandes GEST

- **FR13:** L'utilisateur peut visualiser l'en-tête de bande décodé avec les métadonnées lisibles
- **FR14:** L'utilisateur peut visualiser la liste des cartes avec leurs champs décodés et libellés
- **FR15:** L'utilisateur peut naviguer par individu (INSEE/NUDOS)
- **FR16:** L'utilisateur peut naviguer par type de carte
- **FR17:** L'utilisateur peut filtrer l'affichage par type de carte
- **FR18:** L'utilisateur peut consulter le détail d'une carte avec tous ses champs positionnels décodés

### Modification de Fichiers GEST

- **FR19:** L'utilisateur peut modifier la valeur d'un champ d'une carte via un formulaire d'édition
- **FR20:** Le système valide en temps réel la modification contre le schéma du type de carte (format, longueur, valeurs autorisées)
- **FR21:** Le système empêche la saisie de valeurs non conformes au schéma
- **FR22:** Le système maintient l'intégrité de la ligne à 204 caractères après modification
- **FR23:** Le système reconstruit la ligne brute à partir des champs modifiés

### Comparaison de Fichiers GEST

- **FR24:** L'utilisateur peut sélectionner un fichier GEST de référence et un ou plusieurs fichiers GEST cibles pour comparaison
- **FR25:** Le système apparie les cartes entre référence et cibles selon les clés d'appariement spécifiques à chaque type de carte
- **FR26:** Le système détecte les écarts de valeur champ par champ entre cartes appariées
- **FR27:** Le système identifie les cartes orphelines (présentes en référence mais absentes en comparaison, et inversement)
- **FR28:** Le système identifie les doublons (correspondances multiples)
- **FR29:** Le système identifie les cartes dont l'appariement automatique est impossible (types de cartes dont la combinaison de champs ne permet pas une correspondance unique)
- **FR30:** L'utilisateur peut apparier manuellement des cartes lorsque l'appariement automatique n'est pas possible
- **FR31:** L'utilisateur peut exclure des types de cartes de la comparaison, auquel cas ces cartes sont ignorées et ne génèrent ni différence ni orphelin
- **FR32:** L'utilisateur peut visualiser les résultats de comparaison avec les différences détaillées (champ, valeur référence, valeur comparaison)
- **FR33:** L'utilisateur peut consulter les métriques de comparaison (cartes appariées, cartes avec différences, cartes orphelines)

### Export

- **FR34:** L'utilisateur peut exporter un fichier GEST modifié dans son format d'origine (largeur fixe 204 caractères, encodage Windows-1252)
- **FR35:** Le système exécute une validation complète avant export (longueur, encodage, schéma par type de carte)
- **FR36:** L'utilisateur peut consulter un rapport de validation avant export
- **FR37:** L'utilisateur peut exporter les résultats de comparaison en format Excel
- **FR38:** L'utilisateur peut choisir l'emplacement de sauvegarde via une boîte de dialogue native

### Persistance & Sécurité des Données

- **FR39:** Le système stocke les données importées dans une base de données SQLite locale
- **FR40:** Le système chiffre toutes les données en base de données au repos
- **FR41:** Les données en base ne sont pas accessibles en clair lorsque l'application est fermée
- **FR42:** Le système associe chaque donnée stockée à l'utilisateur authentifié
- **FR43:** Le système nettoie les données sensibles en mémoire à la fermeture de l'application

## Exigences Non-Fonctionnelles

### Performance

- **NFR1:** L'import et le parsing d'un fichier GEST de 10 000 lignes s'effectue en moins de 5 secondes
- **NFR2:** L'affichage structuré des cartes après import est instantané (< 500ms)
- **NFR3:** La navigation entre individus et types de cartes est fluide (< 200ms)
- **NFR4:** La comparaison de deux fichiers GEST de 10 000 lignes s'effectue en moins de 10 secondes
- **NFR5:** La validation en temps réel lors de l'édition d'un champ est imperceptible (< 100ms)
- **NFR6:** L'export d'un fichier GEST modifié s'effectue en moins de 3 secondes

### Sécurité

- **NFR7:** Toutes les données en base SQLite sont chiffrées au repos via un mécanisme de chiffrement transparent
- **NFR8:** Aucune donnée sensible n'est accessible en clair sur le disque lorsque l'application est fermée
- **NFR9:** Les mots de passe utilisateur sont hashés (jamais stockés en clair)
- **NFR10:** Les données sensibles en mémoire sont nettoyées à la fermeture de l'application
- **NFR11:** Cloisonnement strict : un utilisateur ne peut en aucun cas accéder aux données d'un autre utilisateur
- **NFR12:** Conformité RGPD : aucune donnée personnelle (INSEE, RIB, données de paie) n'est stockée en clair, transmise à un tiers, ou accessible sans authentification préalable

### Accessibilité

- **NFR13:** L'interface respecte le niveau minimum WCAG 2.1 A (contraste, navigation clavier, labels)
- **NFR14:** Les éléments interactifs sont accessibles au clavier
- **NFR15:** Les libellés et textes sont lisibles avec un contraste suffisant
