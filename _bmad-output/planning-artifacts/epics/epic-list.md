# Epic List

## Epic 1 : Fondations Projet & Authentification Sécurisée
L'utilisateur peut créer un compte, s'authentifier et accéder à un espace de données sécurisé et cloisonné. Cette épique pose les fondations techniques (starter template officiel composé, CI/CD, BDD SQLite chiffrée via SQLCipher, stack sécurité Argon2id/keyring/zeroize) et délivre le premier flux utilisateur complet : inscription → connexion → session sécurisée → déconnexion.
**FRs couvertes :** FR1, FR2, FR3, FR4, FR39, FR40, FR41, FR42, FR43

## Epic 2 : Import & Analyse de Fichiers GEST
L'utilisateur peut importer un fichier GEST (dialogue ou drag & drop), le système valide automatiquement chaque ligne (longueur 204 caractères, encodage Windows-1252, schéma par type de carte), décode l'en-tête de bande et classe les cartes parmi les 31 types supportés. Un rapport de validation complet est affiché (lignes OK/KO, détail des erreurs). Le fichier est persisté dans la BDD chiffrée. Point d'entrée de tous les parcours utilisateurs.
**FRs couvertes :** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR44

## Epic 3 : Visualisation Structurée & Navigation
L'utilisateur peut explorer un fichier GEST importé via une interface structurée : en-tête de bande décodé avec métadonnées lisibles, navigation hiérarchique par individu (INSEE/NUDOS) et par type de carte, filtrage, fiches synthétiques contextuelles (Fichier, Individu, Dossier), et vue détaillée d'une carte avec tous ses champs positionnels décodés et vue brute segmentée. C'est le cœur de la proposition de valeur — le moment "aha".
**FRs couvertes :** FR13, FR14, FR15, FR16, FR17, FR18

## Epic 4 : Édition Sécurisée & Export GEST
L'utilisateur peut modifier les champs d'une carte via un formulaire d'édition contraint avec validation temps réel (format, longueur, valeurs autorisées), blocage des valeurs non conformes, maintien de l'intégrité à 204 caractères et reconstruction de la ligne brute. Puis exporter le fichier GEST modifié dans son format d'origine (Windows-1252) après validation complète et consultation du rapport de validation, via une boîte de dialogue native. Workflow complet de Sophie en < 30 secondes.
**FRs couvertes :** FR19, FR20, FR21, FR22, FR23, FR34, FR35, FR36, FR38

## Epic 5 : Comparaison Multi-Fichiers & Export Rapport
L'utilisateur peut comparer un fichier GEST de référence avec un ou plusieurs fichiers cibles. Le système apparie les cartes par clés spécifiques, détecte les écarts champ par champ, identifie les orphelins, doublons et cartes non appariables automatiquement. L'utilisateur peut apparier manuellement, exclure des types de cartes, visualiser les résultats détaillés avec métriques (dashboard statistique + drill-down), et exporter le rapport de comparaison en Excel. Workflow complet de Marc pour la validation de migration.
**FRs couvertes :** FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR32, FR33, FR37
