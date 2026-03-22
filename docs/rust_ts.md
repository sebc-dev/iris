# Architecture Tauri v2 pour IRIS : Rust-first, TypeScript-first, ou hybride ?

**L'approche hybride progressive — TypeScript-first avec un noyau Rust ciblé — est la stratégie optimale pour IRIS.** Ni le tout-Rust ni le tout-TypeScript ne correspondent au profil de ce projet. La recherche montre qu'un développeur solo débutant en Rust, utilisant Claude Code, maximise ses chances de livrer un produit maintenable en conservant la logique métier principale en TypeScript tout en déléguant à Rust trois responsabilités non négociables : le chiffrement SQLCipher, l'encodage Windows-1252 (aller-retour), et les opérations fichiers sensibles. Cette recommandation repose sur l'absence totale de solution viable de chiffrement SQLite côté WebView, sur le retour d'expérience de projets Tauri en production, et sur l'analyse de la capacité réelle des LLMs à générer du Rust fiable. Niveau de confiance global : **Élevé**.

---

## Tableau de décision : trois options face aux quatre critères

| Critère (pondération) | Option A — Rust-first | Option B — TypeScript-first | **Option C — Hybride progressive** |
|---|---|---|---|
| **Maintenabilité** (40%) | ⭐⭐ — Code Rust opaque pour un débutant, dette cognitive élevée | ⭐⭐⭐⭐ — Maîtrise native du langage, debugging familier | **⭐⭐⭐⭐** — TS pour le gros du code, Rust cantonné à un périmètre maîtrisable |
| **Qualité IA / Claude Code** (25%) | ⭐⭐⭐ — Le compilateur Rust rattrape les erreurs de Claude, mais volume de code Rust à reviewer élevé | ⭐⭐⭐⭐ — Génération TS fiable, mais erreurs runtime invisibles | **⭐⭐⭐⭐** — Le meilleur des deux : TS pour le volume, Rust+compilateur pour le critique |
| **Performance** (20%) | ⭐⭐⭐⭐ — Parsing natif rapide, mais gain annulé par l'IPC à 2 Mo | ⭐⭐⭐ — Suffisant à l'échelle de 10K lignes (≈25 ms de parsing) | **⭐⭐⭐⭐** — Rust pour l'encodage et le I/O, TS pour le reste — optimal |
| **Productivité solo** (15%) | ⭐⭐ — Courbe d'apprentissage Rust, debugging plus lent, build plus long | ⭐⭐⭐⭐⭐ — Itération rapide, écosystème familier | **⭐⭐⭐⭐** — Prototypage rapide en TS, Rust limité et assisté par Claude |
| **Score pondéré** | **2,65 / 5** | **3,85 / 5** | **4,00 / 5** |

L'option hybride progressive l'emporte avec un avantage clair sur la productivité et la maintenabilité, tout en préservant les garanties de sécurité que seul Rust peut offrir dans le contexte Tauri.

---

## Le chiffrement tranche le débat : Rust est incontournable pour la sécurité

La question « peut-on se passer de Rust ? » reçoit une réponse nette : **non, pas pour le chiffrement**. Le plugin officiel `tauri-plugin-sql` ne supporte pas le chiffrement — la feature request est ouverte depuis plus de 3 ans sans résolution. Côté WebView, `sql.js` (SQLite compilé en WASM) ne supporte pas SQLCipher, et les modules Node.js comme `better-sqlite3-sqlcipher` ne fonctionnent pas dans un contexte navigateur. Il n'existe aucune solution viable de chiffrement SQLite côté JavaScript dans un WebView Tauri.

En revanche, côté Rust, **`rusqlite` avec la feature `bundled-sqlcipher`** est une solution mature, production-ready, avec plus de 4 000 étoiles GitHub. L'alternative `sqlx` avec override de `libsqlite3-sys` fonctionne également, avec des implémentations de référence documentées (gestionnaires de mots de passe Tauri v2). Pour le stockage de la clé maître, `tauri-plugin-stronghold` (v2.2.0, plugin officiel) offre un coffre chiffré dédié aux secrets.

Au-delà du chiffrement au repos, la gestion mémoire des données sensibles (RIB, numéros INSEE, données salariales) constitue un argument structurel. JavaScript ne fournit **aucun mécanisme pour effacer la mémoire de manière fiable** : les chaînes sont immuables, le ramasse-miettes est non déterministe, et il n'existe pas d'équivalent à `write_volatile`. Le moteur V8 peut créer des copies multiples lors de la compilation JIT ou de la compaction du GC — hors de tout contrôle du développeur. En Rust, les crates `zeroize` (effacement garanti non optimisable par le compilateur) et `secrecy` (wrapper `SecretBox<T>` avec Debug masqué et zéroisation au drop) sont matures et utilisées en production par 1Password. Niveau de confiance : **Élevé**.

---

## Performance à l'échelle GEST : l'avantage Rust est réel mais non décisif

Les benchmarks de parsing CSV montrent que **Rust est environ 4,5× plus rapide que Node.js** pour le traitement de fichiers volumineux (366 MiB/s vs 80 MiB/s sur un fichier de 817 Mo). Mais IRIS traite des fichiers GEST d'environ **2 Mo** (10 000 lignes × 204 caractères). À cette échelle, les temps estimés sont de l'ordre de **5-6 ms en Rust contre 15-30 ms en JavaScript** — une différence imperceptible pour l'utilisateur.

Le problème est que cette différence est encore réduite par **l'overhead IPC de Tauri**. La sérialisation JSON via serde, le transport IPC, et le parsing côté JavaScript ajoutent **5 à 25 ms supplémentaires** selon la plateforme (un benchmark communautaire rapporte ~5 ms sur macOS mais ~200 ms sur Windows pour 10 Mo de données). Pour un fichier GEST parsé, le coût total d'un aller-retour Rust (parse + sérialisation + IPC + désérialisation JS) est estimé à **8-55 ms**, contre **15-30 ms** pour un parsing entièrement en JavaScript sans franchir la frontière IPC. À cette échelle, **le gain net de Rust peut être nul ou négatif**.

Cependant, deux opérations justifient Rust sur le plan technique plutôt que sur celui de la vitesse. Premièrement, **l'encodage Windows-1252 en écriture** : l'API Web `TextEncoder` ne supporte que l'UTF-8. Ré-encoder vers Windows-1252 à l'export nécessite soit une table de correspondance manuelle en JS, soit la crate `encoding_rs` qui gère cela nativement à des vitesses proches de `memcpy`. Deuxièmement, **la comparaison multi-fichiers** : si IRIS doit comparer simultanément plusieurs fichiers GEST volumineux, Rust permet le parallélisme natif via `rayon`, là où JavaScript reste monothread dans le WebView. Niveau de confiance : **Moyen** (extrapolations à partir de benchmarks sur des tâches différentes).

---

## Claude Code et Rust : le compilateur comme filet de sécurité

La question de la qualité du code généré par IA est centrale pour ce projet. Les données formelles sont encourageantes : dans le benchmark DevQualityEval v1.1 (300+ modèles, 120 cas Rust par modèle), **Claude 3.7 Sonnet obtient 95,13% de réussite** sur les tâches de génération Rust. Mais la moyenne tous modèles confondus n'est que de 69%, et les études de niveau repository (Rust-SWE-bench) montrent que même les meilleurs agents ne résolvent que **21-29% des tâches** de génie logiciel réel en Rust.

Les modes d'échec typiques des LLMs en Rust sont identifiés : violations du borrow checker, annotations de lifetime complexes, utilisation d'APIs obsolètes, patterns non idiomatiques (abus de `.clone()` et `.unwrap()`), et hallucination de noms de crates inexistants. **Mais le point crucial est que la grande majorité de ces erreurs sont détectées à la compilation**, contrairement à TypeScript où des erreurs équivalentes deviennent des bugs runtime. Julian Schrittwieser (ingénieur Anthropic, AlphaProof) confirme : « *Rust is great for letting Claude Code work unsupervised on larger tasks. The combination of a powerful type system with strong safety checks acts like an expert code reviewer.* »

Un témoignage directement pertinent : un développeur **sans aucune expérience Rust** a construit une application Tauri v2 complète en utilisant des agents IA (Codex + Claude Code), déclarant : « *As long as you let AI agents write the code, having no Rust experience is no problem at all.* » Son workflow : décrire les exigences → l'IA génère le Rust → compilation/vérification → ajustements avec Claude Code.

L'étude RustEvo² démontre que **fournir de la documentation en contexte (RAG) améliore les taux de réussite de 13,5%** pour les APIs post-entraînement. Les Microsoft Rust Guidelines incluent une section explicitement conçue pour la consommation par les LLMs, avec des recommandations comme « *Create Idiomatic Rust API Patterns* » et « *Provide Thorough Docs* ». Intégrer ces guidelines dans un fichier `CLAUDE.md` est une stratégie documentée et recommandée.

Toutefois, **aucune étude formelle ne compare directement les taux d'erreur LLM entre Rust et TypeScript** sur des tâches identiques. L'avantage du compilateur Rust comme garde-fou est un fait ; que cela compense le corpus d'entraînement plus large de TypeScript reste une extrapolation analytique. Niveau de confiance : **Moyen-Élevé**.

---

## Retours d'expérience : ce que les projets Tauri en production enseignent

L'écosystème Tauri présente un **spectre architectural large**, du quasi-zéro Rust au tout-Rust, avec des leçons contrastées pour un développeur solo.

**Le cas Spacedrive est un avertissement majeur.** Jamie Pine a réécrit en solo la v2 de ce gestionnaire de fichiers : 183 000 lignes de Rust, architecture élégante avec CQRS, SeaORM, sync P2P, système d'extensions WASM. Résultat : **aucune version stable n'a jamais été livrée**. Son diagnostic : « *The surface area of a file manager supporting five operating systems is inherently too large... As a solo founder, that surface area was not reducible to something shippable.* » La v3 a pivoté vers un périmètre drastiquement réduit.

**À l'opposé, Aptakube (client Kubernetes) est une réussite solo.** Son développeur, polyglotte avec 7+ langages professionnels, utilise un minimum de Rust et s'appuie sur les APIs JavaScript de Tauri et les assistants IA. Il a livré 20+ releases. Son témoignage est révélateur : « *I still can't say I truly know Rust. I know enough to be constantly shipping new features... GitHub Copilot and ChatGPT have been a huge help.* »

**Firezone (client VPN)** illustre l'approche hybride : prototype GUI en TypeScript d'abord, logique réseau déjà en Rust (`connlib`), intégration progressive. Deux mois pour un beta Windows. Mais leur équipe connaissait déjà Rust.

Le message récurrent de la communauté pour les développeurs solo débutants en Rust est cohérent : **minimiser la surface Rust, exploiter les plugins et APIs JavaScript de Tauri, et ne passer en Rust que pour les nécessités techniques avérées** (sécurité, performance prouvée, accès système). Niveau de confiance : **Élevé**.

---

## Matrice « que mettre où » pour chaque traitement d'IRIS

| Traitement | Recommandation | Justification |
|---|---|---|
| **Lecture de fichiers GEST (I/O + décodage Win-1252)** | 🦀 Rust | Accès fichier natif, `encoding_rs` pour décodage fiable, pas de limitation `TextEncoder` |
| **Parsing des lignes (découpage positionnel 204 chars)** | 🟡 TypeScript (MVP) → Rust (optionnel) | Opération substring triviale, ~25 ms en JS pour 10K lignes, gain Rust annulé par IPC |
| **Validation longueur et encodage** | 🟡 TypeScript (MVP) → Rust (optionnel) | Validation simple, retour immédiat à l'UI sans round-trip IPC |
| **Validation schéma par type de carte (31 types)** | 📘 TypeScript | Logique métier complexe évoluant fréquemment, plus facile à itérer et débugger en TS |
| **Comparaison multi-fichiers avec appariement** | 📘 TypeScript (MVP) → 🦀 Rust (si performance insuffisante) | Candidat à la migration si les volumes augmentent (parallélisme Rayon) |
| **Édition de champs avec validation temps réel** | 📘 TypeScript | Interaction UI directe, latence IPC inacceptable pour le temps réel |
| **Reconstruction de lignes brutes** | 📘 TypeScript | Manipulation de chaînes côté UI, pas de round-trip nécessaire |
| **Export avec ré-encodage Windows-1252** | 🦀 Rust | `TextEncoder` JS ne supporte pas Win-1252 — `encoding_rs` est la seule option fiable |
| **Chiffrement SQLite (SQLCipher)** | 🦀 Rust | Aucune solution JS viable en WebView — `rusqlite` + `bundled-sqlcipher` obligatoire |
| **Stockage clé maître** | 🦀 Rust (Stronghold) | Plugin officiel Tauri, coffre chiffré dédié |
| **Nettoyage mémoire données sensibles** | 🦀 Rust | `zeroize` + `secrecy` — JS n'offre aucune garantie |
| **Requêtes base de données** | 🦀 Rust | Toutes les requêtes passent par des commandes Tauri — la DB n'est jamais exposée au WebView |
| **State management UI** | 📘 TypeScript (Svelte stores) | État local de l'interface, réactivité Svelte native |
| **State global application** | 🟡 Hybride | État critique (session, clé DB) en Rust via `tauri::manage()`, état UI en Svelte |

Légende : 🦀 = Rust obligatoire, 📘 = TypeScript recommandé, 🟡 = Hybride ou migrable

---

## Plan d'action pour l'approche hybride progressive

**Phase 1 — Fondations Rust (semaines 1-2).** Mettre en place le noyau Rust incompressible : intégration `rusqlite` + `bundled-sqlcipher`, configuration de `tauri-plugin-stronghold` pour la clé maître, commandes Tauri pour les opérations CRUD sur la base chiffrée, lecture de fichiers GEST avec décodage `encoding_rs`, et export avec ré-encodage Windows-1252. Ce périmètre représente environ **5-8 commandes Tauri** et constitue le minimum Rust viable. Configurer le fichier `CLAUDE.md` avec les Microsoft Rust Guidelines (section AI + checklist), les patterns de commandes Tauri v2, et les conventions du projet.

**Phase 2 — Logique métier TypeScript (semaines 3-6).** Implémenter en TypeScript côté Svelte : le parseur positionnel GEST (substring sur les lignes décodées en UTF-8 reçues de Rust), les 31 schémas de validation par type de carte, l'éditeur de champs avec validation temps réel, la reconstruction de lignes, et la comparaison multi-fichiers. Cette phase exploite la maîtrise TypeScript du développeur et la vélocité d'itération de Svelte.

**Phase 3 — Intégration et sécurisation (semaines 7-8).** Connecter les deux couches : le frontend appelle Rust pour lire/écrire les fichiers et la base, traite les données en mémoire en TypeScript, et renvoie à Rust pour l'export encodé et le stockage chiffré. Activer le pattern d'isolation Tauri, configurer la CSP stricte, définir les capabilities minimales. Tester le flux complet lecture → parsing → édition → export → stockage.

**Phase 4 — Optimisation sélective (post-MVP).** Mesurer les performances réelles. Si le parsing ou la comparaison multi-fichiers s'avère lent sur des fichiers particulièrement volumineux, migrer ces traitements vers Rust en utilisant les types déjà définis côté TypeScript comme spécification pour Claude Code. Utiliser `tauri-specta` pour la synchronisation automatique des types Rust↔TypeScript.

**Configuration Claude Code recommandée :**

- Inclure dans `CLAUDE.md` : les Microsoft Rust Guidelines (checklist + section AI), les patterns de commandes Tauri v2 (`#[tauri::command]`, `State<'_, Mutex<T>>`, `tauri::ipc::Response` pour les données binaires), les conventions de nommage (snake_case Rust ↔ camelCase JS automatique), et l'interdiction de `unwrap()` en production (exiger `?` ou gestion d'erreur explicite avec `thiserror`)
- Pour chaque commande Rust, demander à Claude de générer le test unitaire correspondant (`cargo test`)
- Utiliser le pattern « compile → fix → iterate » : laisser Claude écrire le Rust, compiler, renvoyer les erreurs à Claude pour correction

---

## Risques et stratégies de mitigation

**Risque 1 : Code Rust opaque généré par Claude que le développeur ne comprend pas.** C'est le risque principal. Mitigation : cantonner le Rust à un périmètre restreint et stable (~500-1000 lignes maximum au MVP), exiger des commentaires explicatifs dans chaque commande Tauri, écrire des tests unitaires exhaustifs qui documentent le comportement attendu, et investir progressivement dans l'apprentissage Rust ciblé sur les patterns utilisés (ownership basique, `Mutex`, `Result`, serde). Le compilateur agit comme garde-fou : si le code compile et que les tests passent, le risque de bug mémoire est quasi nul.

**Risque 2 : L'IPC Tauri devient un goulot d'étranglement sur Windows.** Les benchmarks communautaires montrent des latences IPC significativement plus élevées sur Windows (~200 ms pour 10 Mo) que sur macOS (~5 ms). Mitigation : minimiser les transferts de données volumineux, utiliser `tauri::ipc::Response` pour les données binaires au lieu du JSON, et si nécessaire, garder les données parsées côté Rust et n'envoyer au frontend que les pages visibles (pagination virtuelle).

**Risque 3 : Évolution des schémas de validation GEST.** Les 31 types de cartes et leurs règles de validation évolueront. Si cette logique est en TypeScript, les modifications sont rapides et testables avec Vitest. Si elle avait été en Rust, chaque changement impliquerait un cycle compile+test plus lourd. La recommandation de garder cette logique en TypeScript atténue ce risque.

**Risque 4 : Fragmentation des WebViews cross-platform.** Plusieurs équipes en production (dont Caido) rapportent que les WebViews système causent 90%+ des rapports de bugs. Mitigation : cibler initialement Windows uniquement (WebView2/Chromium, le plus stable), et tester systématiquement sur la version de WebView2 la plus ancienne que les utilisateurs cibles possèdent.

**Risque 5 : La migration progressive ne se fait jamais.** Le confort du TypeScript-first peut décourager toute migration vers Rust. Mitigation : définir dès le départ des **seuils de déclenchement** mesurables (temps de parsing > 200 ms, fichiers > 50 000 lignes) qui justifieront la migration. Structurer le code TypeScript avec des interfaces claires (pattern Repository/Service) qui faciliteront le remplacement par des appels Rust.

**Risque 6 : Mises à jour de dépendances Rust.** L'écosystème Rust (crates) évolue rapidement. `rusqlite`, `encoding_rs`, et les plugins Tauri auront des breaking changes. Mitigation : utiliser `cargo-audit` pour les vulnérabilités, épingler les versions majeures dans `Cargo.toml`, et limiter le nombre de crates (5-8 dépendances directes maximum). Les crates recommandées (`rusqlite`, `encoding_rs`, `zeroize`, `secrecy`, `serde`, `thiserror`) sont toutes matures et activement maintenues.