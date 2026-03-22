# Epic 4 : Édition Sécurisée & Export GEST

L'utilisateur peut modifier les champs d'une carte via un formulaire d'édition contraint avec validation temps réel, puis exporter le fichier GEST modifié dans son format d'origine (Windows-1252, 204 caractères/ligne) après validation complète. Workflow complet de Sophie en < 30 secondes.

## Story 4.1 : Toggle mode édition et édition contrainte des champs

As a utilisateur (Sophie, Karim),
I want activer un mode édition et modifier la valeur d'un champ avec validation temps réel qui m'empêche de saisir des valeurs invalides,
So that je puisse corriger des données en toute confiance sans risquer de corrompre le fichier GEST.

**Acceptance Criteria:**

**Given** l'utilisateur est dans le module Explorer sur une vue carte
**When** il active le toggle mode édition (bouton ou Ctrl+Shift+E)
**Then** un indicateur visuel clair montre que le mode édition est actif (badge/bordure colorée) (UX-DR16)
**And** les champs passent de lecture seule à éditables
**And** un compteur de modifications pendantes apparaît dans la toolbar (initialement "0 modification") (UX-DR16)
**And** les boutons "Enregistrer" et "Annuler tout" deviennent visibles

**Given** le mode édition est actif
**When** l'utilisateur clique sur un champ pour le modifier
**Then** le composant `GestFieldEditor` s'active (UX-DR6)
**And** le label permanent affiche : nom du champ, type de donnée, positions (ex: "RIB · Alphanum · pos 42-46")
**And** un masque positionnel guide la saisie
**And** un compteur de progression affiche "N/M caractères"

**Given** l'utilisateur édite un champ
**When** il tape des caractères
**Then** la validation s'effectue en temps réel en moins de 100ms (NFR5, FR20)
**And** les caractères non autorisés par le type sont silencieusement rejetés (pas de message d'erreur) (FR21)
**And** la longueur maximale du champ est respectée — impossible de dépasser

**Given** l'utilisateur édite un champ
**When** la valeur est en cours de saisie (incomplète mais potentiellement valide)
**Then** l'état Intermediate est affiché : bordure ambre + ⏳ (UX-DR6)
**And** aucun message d'erreur n'est affiché (anti-validation prématurée)

**Given** l'utilisateur a fini de saisir (blur ou complétion)
**When** la valeur est conforme au schéma du type de carte
**Then** l'état Acceptable est affiché : bordure verte + ✓ (UX-DR6)
**And** le compteur de modifications pendantes s'incrémente

**Given** l'utilisateur a fini de saisir
**When** la valeur est non conforme au schéma
**Then** l'état Invalid est affiché : bordure rouge + ✗ avec un message d'erreur inline sous le champ (UX-DR6)

**Given** le champ a une sévérité Stop
**When** l'utilisateur tente de saisir un caractère invalide
**Then** la frappe est bloquée silencieusement (UX-DR6)

**Given** le champ a une sévérité Warning
**When** la valeur est métier-improbable mais techniquement légale
**Then** un avertissement ⚠️ est affiché mais la saisie est autorisée

**Given** le mode édition est actif
**When** l'utilisateur appuie sur Ctrl+Z
**Then** la dernière modification est annulée (UX-DR26)
**And** le compteur de modifications se décrémente

**Given** le mode édition est actif et des modifications sont pendantes
**When** l'utilisateur désactive le toggle sans enregistrer
**Then** une confirmation est demandée via Dialog : "Vous avez N modifications non enregistrées. Annuler les modifications ?"

**Given** l'édition est vérifiée
**When** je contrôle l'accessibilité du GestFieldEditor
**Then** `aria-invalid` est défini correctement selon l'état de validation
**And** `aria-describedby` pointe vers le message de validation
**And** la navigation clavier entre champs fonctionne (Tab/Shift+Tab)

## Story 4.2 : Intégrité des lignes et suivi des modifications

As a utilisateur (Sophie),
I want que chaque modification maintienne l'intégrité de la ligne à 204 caractères et voir un aperçu de toutes mes modifications avant de les enregistrer,
So that je sois sûre que le fichier reste structurellement valide et que je puisse vérifier mes changements avant de les confirmer.

**Acceptance Criteria:**

**Given** l'utilisateur a modifié la valeur d'un champ
**When** la modification est validée
**Then** le service `gestReconstructor.ts` reconstruit la ligne brute de 204 caractères à partir des champs modifiés (FR23)
**And** la longueur de la ligne reconstruite est strictement de 204 caractères (FR22)
**And** la vue brute (GestRawView) se met à jour en temps réel pour refléter la modification
**And** le segment modifié dans la vue brute est visuellement différencié (surlignage)

**Given** l'utilisateur a modifié un champ numérique plus court que la longueur du champ
**When** la ligne est reconstruite
**Then** le champ est complété avec les caractères de remplissage appropriés selon le type (espaces ou zéros) pour maintenir l'alignement positionnel
**And** la longueur totale reste 204 caractères

**Given** l'utilisateur a effectué plusieurs modifications
**When** il clique sur le compteur de modifications ou le bouton "Aperçu" (GestChangeTracker — UX-DR12)
**Then** un Dialog/Sheet s'ouvre montrant chaque modification : champ concerné, ancienne valeur → nouvelle valeur, avec surlignage style code review (vert pour ajout, rouge pour suppression)
**And** la liste est navigable au clavier

**Given** l'aperçu des modifications est affiché
**When** l'utilisateur clique sur "Enregistrer les changements" (bouton primaire)
**Then** toutes les modifications sont persistées en BDD (lignes brutes mises à jour + champs décodés)
**And** le compteur de modifications revient à 0
**And** un toast de succès confirme l'enregistrement (UX-DR18)

**Given** l'aperçu des modifications est affiché
**When** l'utilisateur clique sur "Annuler tout" (bouton destructif secondaire)
**Then** une confirmation est demandée via Dialog
**And** si confirmé, toutes les modifications pendantes sont annulées
**And** les valeurs d'origine sont restaurées dans les champs et la vue brute
**And** le compteur revient à 0

**Given** l'utilisateur appuie sur Ctrl+S en mode édition
**When** des modifications sont pendantes
**Then** les modifications sont enregistrées (même comportement que le bouton "Enregistrer") (UX-DR26)

**Given** le service de reconstruction existe
**When** je vérifie les tests
**Then** `gestReconstructor.test.ts` couvre : reconstruction après modification d'un champ, maintien à 204 caractères, remplissage correct selon le type, modification de plusieurs champs sur la même ligne

## Story 4.3 : Validation complète avant export et rapport

As a utilisateur (Sophie),
I want que le système valide complètement le fichier avant export et m'affiche les erreurs restantes,
So that je sois certaine que le fichier GEST exporté sera accepté par les systèmes de traitement de paie.

**Acceptance Criteria:**

**Given** l'utilisateur demande un export (bouton "Exporter" dans la toolbar du module Explorer)
**When** la validation pré-export se déclenche
**Then** le système exécute une validation complète sur toutes les lignes du fichier (FR35) : longueur = 204 caractères, encodage Windows-1252 valide, schéma par type de carte respecté (positions, formats, valeurs autorisées)

**Given** la validation est terminée et des erreurs existent
**When** le rapport pré-export s'affiche (GestValidationPanel variante export — UX-DR11)
**Then** une liste navigable d'erreurs est affichée dans un style MessagePopover (UX-DR11)
**And** chaque erreur affiche : numéro de ligne, badge type d'erreur, message descriptif (FR36)
**And** le bouton d'export est désactivé tant que des erreurs bloquantes existent

**Given** le rapport pré-export affiche des erreurs
**When** l'utilisateur clique sur une erreur
**Then** la navigation va directement vers la ligne/champ concerné dans l'Explorer
**And** le mode édition s'active automatiquement si nécessaire
**And** le champ en erreur est mis en surbrillance

**Given** la validation est terminée et aucune erreur n'existe
**When** le rapport s'affiche
**Then** un indicateur de succès vert ✓ est affiché : "Fichier valide — prêt pour l'export"
**And** le bouton d'export est activé (bouton primaire)

**Given** le rapport de validation est affiché
**When** je vérifie l'accessibilité
**Then** le panneau utilise `role="log"` avec `aria-live="polite"` (UX-DR23)
**And** les badges d'erreur ont un double encodage couleur + symbole (UX-DR21)

## Story 4.4 : Export du fichier GEST modifié

As a utilisateur (Sophie, Karim),
I want exporter le fichier GEST modifié dans son format d'origine (largeur fixe 204 caractères, encodage Windows-1252),
So that le fichier soit prêt pour envoi aux systèmes de traitement de paie sans aucune altération de format.

**Acceptance Criteria:**

**Given** la validation pré-export est passée sans erreur
**When** l'utilisateur clique sur le bouton d'export
**Then** une boîte de dialogue native Tauri s'ouvre pour choisir l'emplacement de sauvegarde (FR38)
**And** le nom de fichier par défaut est le nom du fichier d'origine avec un suffixe (ex: `DADS2024_modifie.gest`)

**Given** l'utilisateur a choisi un emplacement
**When** l'export s'exécute
**Then** la commande Rust `export_file` ré-encode toutes les lignes en Windows-1252 via encoding_rs (FR34)
**And** chaque ligne exportée fait exactement 204 caractères
**And** une barre de progression est affichée pendant l'export (UX-DR20)
**And** l'export d'un fichier s'effectue en moins de 3 secondes (NFR6)

**Given** l'export est terminé avec succès
**When** le fichier est écrit sur le disque
**Then** un toast de succès est affiché avec le chemin du fichier exporté (UX-DR18)
**And** le fichier exporté est un fichier GEST standard lisible par les systèmes de traitement de paie

**Given** l'export échoue (erreur d'écriture, permissions)
**When** l'erreur survient
**Then** un toast d'erreur persistant est affiché avec un message descriptif
**And** aucun fichier corrompu n'est laissé sur le disque

**Given** l'utilisateur annule la boîte de dialogue
**When** aucun emplacement n'est sélectionné
**Then** l'export est annulé sans effet de bord ni message d'erreur
