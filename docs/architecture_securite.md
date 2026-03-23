# Architecture de sécurité complète pour Tauri V2 : guide de référence

**La stack recommandée pour une application Tauri V2 commerciale manipulant des données sensibles repose sur quatre piliers : Argon2id + OAuth2/PKCE pour l'authentification, rusqlite avec SQLCipher (bundled-sqlcipher-vendored-openssl) pour le chiffrement at-rest, le crate keyring pour le stockage des secrets via les keychains OS natifs, et le Isolation Pattern de Tauri combiné à secrecy/zeroize pour la protection des données en transit et en mémoire.** Cette architecture, validée contre les exigences de l'article 32 du RGPD et les recommandations de la CNIL, offre un niveau de sécurité adapté aux données financières et médicales tout en restant implémentable par un développeur intermédiaire. Le document ci-dessous couvre Tauri **v2.10.3** (publiée le 4 mars 2026), dernière version stable à date.

---

## Partie 1 — Authentification : Argon2id en local, OAuth2/PKCE pour les fournisseurs externes

**Résumé décisionnel :** Utiliser le crate `argon2` (RustCrypto, v0.5.3) avec Argon2id pour le hashing de mots de passe côté Rust. Pour l'OAuth2, combiner `tauri-plugin-oauth` (v2.0.0, serveur localhost) avec le crate `oauth2` (v5.0.0) et PKCE. Pour la biométrie desktop, `tauri-plugin-biometry` (communautaire, Choochmeque) couvre macOS/Windows avec fallback mot de passe sur Linux. Stocker les refresh tokens via le crate `keyring` (v3.6.3).

### Hashing de mots de passe

Le crate `argon2` de RustCrypto (v0.5.3, licence MIT/Apache-2.0) implémente Argon2id en Rust pur, conformément aux recommandations OWASP 2024 et CNIL. L'auteur même du crate `bcrypt` recommande Argon2 pour tout nouveau projet. Argon2id combine résistance aux attaques GPU (memory-hard) et aux attaques par canaux auxiliaires.

```rust
// Cargo.toml
// argon2 = "0.5.3"
use argon2::{Argon2, PasswordHasher, PasswordVerifier,
             password_hash::{SaltString, rand_core::OsRng}};

#[tauri::command]
fn hash_password(password: String) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default(); // Argon2id par défaut
    argon2.hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn verify_password(password: String, hash: String) -> Result<bool, String> {
    let parsed = argon2::PasswordHash::new(&hash).map_err(|e| e.to_string())?;
    Ok(Argon2::default().verify_password(password.as_bytes(), &parsed).is_ok())
}
```

### OAuth2/OIDC en contexte desktop

L'approche **serveur localhost temporaire** via `tauri-plugin-oauth` (v2.0.0, par FabianLars) est la seule méthode fiable cross-platform. Les deep links (`tauri-plugin-deep-link`) échouent car de nombreux fournisseurs (Google, GitHub) rejettent les schémas URI personnalisés, et WebKit sur macOS bloque les redirections non-HTTPS. Le plugin ouvre un port éphémère, capture le code d'autorisation, puis ferme le serveur.

```rust
// Cargo.toml
// tauri-plugin-oauth = "2.0.0"
// oauth2 = "5.0.0"
// openidconnect = "4.0.1"

use oauth2::{basic::BasicClient, AuthUrl, TokenUrl, ClientId,
             RedirectUrl, CsrfToken, PkceCodeChallenge, Scope,
             AuthorizationCode, TokenResponse};

#[tauri::command]
async fn start_oauth(window: tauri::Window) -> Result<String, String> {
    let port = tauri_plugin_oauth::start(move |url| {
        let _ = window.emit("oauth-redirect", url);
    }).map_err(|e| e.to_string())?;

    let client = BasicClient::new(ClientId::new("client_id".into()))
        .set_auth_uri(AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".into()).unwrap())
        .set_token_uri(TokenUrl::new("https://oauth2.googleapis.com/token".into()).unwrap())
        .set_redirect_uri(RedirectUrl::new(format!("http://localhost:{}/callback", port)).unwrap());

    let (pkce_challenge, _pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("openid email".into()))
        .set_pkce_challenge(pkce_challenge)
        .url();

    Ok(auth_url.to_string())
}
```

### Biométrie desktop

Le plugin officiel `tauri-plugin-biometric` (v2.2.1) ne supporte **que iOS et Android**. Pour le desktop, `tauri-plugin-biometry` (communautaire, par Choochmeque, mis à jour le 24 février 2026) prend en charge **Windows Hello** et **macOS Touch ID**. Linux n'a pas de support biométrique unifié — prévoir un fallback systématique vers le mot de passe. 🟡 Confiance moyenne : plugin communautaire actif mais pas officiel.

|Solution|Type|Plateformes desktop|Maturité|Licence|
|---|---|---|---|---|
|`argon2` (RustCrypto) v0.5.3|Hashing mot de passe|Toutes (Rust pur)|🟢 12M+ downloads|MIT/Apache-2.0|
|`tauri-plugin-oauth` v2.0.0|OAuth2 localhost redirect|Toutes|🟢 Stable, utilisé en production|MIT [À VÉRIFIER]|
|`oauth2` crate v5.0.0|Client OAuth2 avec PKCE|Toutes (Rust pur)|🟢 Largement adopté|MIT/Apache-2.0|
|`tauri-plugin-biometry`|Biométrie native|macOS ✓, Windows ✓, Linux ✗|🟡 Communautaire, actif|MIT [À VÉRIFIER]|
|`tauri-plugin-authenticator` v2.0.0-rc|WebAuthn/FIDO2 (clés USB)|Toutes|🔴 Encore en RC|Apache-2.0/MIT|

### Gestion des sessions

Les tokens d'accès doivent **rester exclusivement côté Rust** dans un `tauri::State<AuthState>`. Ne jamais exposer de tokens bruts au frontend via IPC. Le frontend reçoit uniquement les résultats autorisés des commandes Tauri. Pour le stockage persistant des refresh tokens, utiliser le crate `keyring` (détaillé en Partie 3). Implémenter un timeout d'inactivité avec verrouillage automatique de la base de données et zeroization des clés en mémoire.

---

## Partie 2 — Chiffrement SQLite : rusqlite + SQLCipher, le choix pragmatique

**Résumé décisionnel :** Utiliser `rusqlite` v0.38.0 avec la feature `bundled-sqlcipher-vendored-openssl` pour un chiffrement AES-256-CBC transparent de toute la base. Dériver la clé via Argon2id côté applicatif (pas le PBKDF2 interne de SQLCipher) et passer une clé brute 256 bits. SQLite3MultipleCiphers n'a pas d'intégration Rust native viable. Le plugin officiel `tauri-plugin-sql` ne supporte pas SQLCipher — utiliser rusqlite directement dans les commandes Tauri.

### Pourquoi SQLCipher via rusqlite

SQLCipher chiffre **l'intégralité du fichier** SQLite : schéma, métadonnées, index, données. Un attaquant ayant accès au fichier ne peut pas même lire les noms de tables. L'overhead typique est de **5 à 15%** selon Zetetic (éditeur de SQLCipher), pouvant monter à 50% sur les full table scans. La licence SQLCipher Community Edition (BSD 3-Clause) **autorise l'utilisation commerciale** avec obligation d'attribution dans l'interface ou la documentation.

```toml
# Cargo.toml
[dependencies]
rusqlite = { version = "0.38.0", features = ["bundled-sqlcipher-vendored-openssl"] }
argon2 = "0.5.3"
zeroize = { version = "1.8.2", features = ["derive"] }
rand = "0.8"
```

La feature `bundled-sqlcipher-vendored-openssl` compile SQLCipher depuis les sources avec un OpenSSL intégré, éliminant toute dépendance système. C'est **la seule option fiable pour le CI/CD cross-platform** — sur macOS seul, `bundled-sqlcipher` utilise automatiquement SecurityFramework sans OpenSSL externe.

### Dérivation de clé et ouverture de la base

Pour maximiser la sécurité, dériver une clé brute 32 octets via Argon2id et contourner le PBKDF2 interne de SQLCipher :

```rust
use argon2::{Argon2, Algorithm, Version, Params};
use zeroize::Zeroizing;
use rusqlite::Connection;

fn derive_db_key(password: &[u8], salt: &[u8; 16]) -> Zeroizing<[u8; 32]> {
    let params = Params::new(19_456, 2, 1, Some(32)).unwrap();
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut key = Zeroizing::new([0u8; 32]);
    argon2.hash_password_into(password, salt, key.as_mut()).unwrap();
    key
}

fn open_encrypted_db(path: &str, password: &str, salt: &[u8; 16])
    -> rusqlite::Result<Connection>
{
    let key = derive_db_key(password.as_bytes(), salt);
    let hex_key: String = key.iter().map(|b| format!("{:02x}", b)).collect();

    let conn = Connection::open(path)?;
    conn.execute_batch(&format!("PRAGMA key = \"x'{}'\"", hex_key))?;
    // Vérification immédiate que la clé est correcte
    conn.query_row("SELECT count(*) FROM sqlite_master", [], |_| Ok(()))?;
    Ok(conn)
}
```

Le `PRAGMA key` **doit être la toute première opération** après `Connection::open`. Toute autre requête avant invalidera le déchiffrement.

### Rotation de clé et changement de mot de passe

SQLCipher supporte `PRAGMA rekey` pour re-chiffrer toute la base avec une nouvelle clé. L'opération est proportionnelle à la taille de la base — prévoir un indicateur de progression pour les bases volumineuses.

```rust
fn change_password(conn: &Connection, new_password: &str, new_salt: &[u8; 16])
    -> rusqlite::Result<()>
{
    let new_key = derive_db_key(new_password.as_bytes(), new_salt);
    let hex_key: String = new_key.iter().map(|b| format!("{:02x}", b)).collect();
    conn.execute_batch(&format!("PRAGMA rekey = \"x'{}'\"", hex_key))?;
    Ok(())
}
```

### Comparaison des solutions de chiffrement SQLite

|Solution|Chiffrement|Licence|Intégration Rust|Cross-platform|Performance|Recommandation|
|---|---|---|---|---|---|---|
|**rusqlite + SQLCipher**|AES-256-CBC, HMAC-SHA512|BSD 3-Clause (attribution)|🟢 Feature Cargo native|🟢 Win/Mac/Linux|5-15% overhead|**🥇 Recommandé**|
|**sqlx + SQLCipher** (override libsqlite3-sys)|AES-256-CBC|BSD 3-Clause|🟡 Override de dépendance|🟢|Similaire|🥈 Si déjà sur sqlx|
|**SQLite3MultipleCiphers**|AES-256, ChaCha20, Ascon|MIT|🔴 Pas de crate natif|🟢 (en C)|Non benchmarké|❌ Pas viable en Rust|
|**Chiffrement applicatif par champ**|AES-256-GCM (custom)|N/A|🟡 Code custom|🟢|Par champ|Complément uniquement|

---

## Partie 3 — Gestion des secrets : keyring OS-natif, Stronghold en voie de dépréciation

**Résumé décisionnel :** Utiliser le crate `keyring` (v3.6.3) pour le stockage des secrets dans les keychains OS natifs (Windows Credential Manager, macOS Keychain, Linux Secret Service). Éviter `tauri-plugin-stronghold` pour les nouveaux projets — il est officiellement signalé comme en voie de dépréciation pour Tauri V3. Ne **jamais** utiliser `tauri-plugin-store` pour des secrets : il stocke du JSON en clair.

### Architecture recommandée : key wrapping avec KEK aléatoire

L'approche la plus sécurisée n'est **pas** de stocker la clé dérivée directement dans le keychain, mais d'utiliser un schéma de key wrapping :

```
[Premier login]
password → Argon2id(password, salt) → derived_key → ouvre SQLCipher
Génère KEK aléatoire (32 octets) → stocke KEK dans keychain OS
Chiffre derived_key avec KEK (AES-256-GCM) → stocke blob chiffré sur disque

[Logins suivants avec "Se souvenir"]
keychain → KEK
disque → blob chiffré
KEK.decrypt(blob) → derived_key → ouvre SQLCipher
```

Ce schéma garantit que **ni le keychain seul ni le fichier disque seul ne suffisent** à retrouver la clé de la base. Révoquer le « Se souvenir » = supprimer le KEK du keychain.

```rust
use keyring::Entry;
use aes_gcm::{Aes256Gcm, KeyInit, aead::{Aead, OsRng}};
use aes_gcm::aead::generic_array::GenericArray;

fn store_wrapped_key(derived_key: &[u8; 32]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    // Générer un KEK aléatoire
    let kek = Aes256Gcm::generate_key(&mut OsRng);

    // Stocker le KEK dans le keychain OS
    let entry = Entry::new("mon-app", "kek")?;
    entry.set_secret(kek.as_slice())?;

    // Chiffrer la clé dérivée avec le KEK
    let cipher = Aes256Gcm::new(&kek);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let mut wrapped = nonce.to_vec();
    wrapped.extend(cipher.encrypt(&nonce, derived_key.as_slice())?);
    Ok(wrapped) // À stocker sur disque
}

fn unwrap_key(wrapped: &[u8]) -> Result<[u8; 32], Box<dyn std::error::Error>> {
    let entry = Entry::new("mon-app", "kek")?;
    let kek_bytes = entry.get_secret()?;
    let kek = GenericArray::from_slice(&kek_bytes);
    let cipher = Aes256Gcm::new(kek);
    let (nonce_bytes, ciphertext) = wrapped.split_at(12);
    let nonce = GenericArray::from_slice(nonce_bytes);
    let key_bytes = cipher.decrypt(nonce, ciphertext)?;
    let mut key = [0u8; 32];
    key.copy_from_slice(&key_bytes);
    Ok(key)
}
```

### Configuration Cargo.toml pour keyring cross-platform

```toml
[dependencies]
keyring = { version = "3.6.3", features = [
    "apple-native",                    # macOS Keychain
    "windows-native",                  # Windows Credential Manager
    "linux-native-sync-persistent"     # keyutils + D-Bus Secret Service
] }
```

### Spécificités par plateforme

**Windows (Credential Manager/DPAPI)** : tout processus exécuté sous le même utilisateur Windows peut lire les credentials — ce n'est pas per-application. Le schéma de key wrapping compense cette faiblesse.

**macOS (Keychain Services)** : accès contrôlé par la signature de code (code signing identity). L'application **doit être signée** pour la production, sinon des erreurs `MissingEntitlement` surviennent. Protection renforcée par le Secure Enclave Processor pour le chiffrement des clés.

**Linux (Secret Service D-Bus)** : nécessite un environnement de bureau (GNOME Keyring, KDE Wallet, ou KeePassXC). La feature `linux-native-sync-persistent` combine `keyutils` (accès rapide kernel) et Secret Service (persistance). Sur un système headless sans D-Bus session, le Secret Service échoue — cas marginal pour une app desktop.

### Comparaison sécurité des solutions de stockage de secrets

|Critère|`keyring` v3.6.3|`tauri-plugin-stronghold` v2.0.0|`tauri-plugin-store` v2.x|
|---|---|---|---|
|Chiffrement at-rest|🟢 OS-level (DPAPI/Keychain/SS)|🟢 XChaCha20-Poly1305|❌ Aucun (JSON clair)|
|Protection per-user|🟢 Imposée par l'OS|🟡 Mot de passe uniquement|❌ Aucune|
|Zeroization mémoire|🟢 Via zeroize intégré|🟢 GuardedVec + libsodium|❌ Aucune|
|Pérennité|🟢 8M+ downloads, actif|🔴 **Dépréciation annoncée pour V3**|🟢 Stable|
|Adapté aux secrets|✅ Oui|✅ Oui|❌ Non|

---

## Partie 4 — Sérialisation et protection des données en transit

**Résumé décisionnel :** Conserver le JSON par défaut pour l'IPC Tauri (non modifiable) et **activer le Isolation Pattern** qui ajoute un chiffrement AES-GCM transparent sur tous les messages IPC. Pour le stockage dans SQLite, utiliser `rmp-serde` (MessagePack) pour sérialiser avant chiffrement. Encapsuler tous les champs sensibles dans `secrecy::SecretBox<T>` pour empêcher les fuites via logs et Debug.

### L'IPC Tauri V2 utilise JSON, point final

Tauri V2 sérialise tous les paramètres et retours de commandes en JSON via `serde_json`. Ce comportement **n'est pas configurable** à date (une proposition de remplacement par un format binaire existe dans l'issue GitHub #7706, mais n'est pas implémentée). Pour les données binaires volumineuses, `tauri::ipc::Response` permet de retourner des octets bruts sans passer par JSON.

Le JSON est suffisant pour l'IPC desktop car les messages ne traversent pas de réseau — ils circulent entre processus sur la même machine. La véritable protection vient du **Isolation Pattern**.

### Isolation Pattern : chiffrement AES-GCM transparent de l'IPC

Activé dans `tauri.conf.json`, ce pattern injecte un iframe sandboxé entre le frontend et le Tauri Core. Chaque message IPC est chiffré avec **AES-GCM** via SubtleCrypto, avec une clé régénérée à chaque lancement. Même si un attaquant injecte du JavaScript via une faille XSS, il ne peut pas forger de messages IPC valides.

```json
{
  "app": {
    "security": {
      "pattern": {
        "use": "isolation",
        "options": { "dir": "../dist-isolation" }
      },
      "csp": "default-src 'self'; script-src 'self'; connect-src ipc: http://ipc.localhost",
      "freezePrototype": true
    }
  }
}
```

🟢 Confiance élevée : fonctionnalité officielle Tauri, documentée et recommandée pour les applications à haute sécurité.

### Protection contre les fuites dans les logs

Le crate `secrecy` (v0.10.x) encapsule les valeurs sensibles dans `SecretBox<T>` qui affiche `[REDACTED]` via `Debug`/`Display` et **n'implémente pas `Serialize`** par défaut, empêchant toute sérialisation accidentelle :

```rust
use secrecy::{SecretString, ExposeSecret};
use zeroize::{Zeroize, ZeroizeOnDrop};

#[derive(Zeroize, ZeroizeOnDrop)]
struct PatientRecord {
    id: u64,
    name: String,
    ssn: String,
}

// Dans les logs — le SSN n'apparaît jamais
struct PatientContext {
    patient_id: u64,          // OK pour les logs
    ssn: SecretString,        // Debug → "[REDACTED]"
}
```

### Comparaison des formats de sérialisation pour le stockage

Pour les données sérialisées **avant chiffrement** dans SQLite, un format binaire compact est préférable au JSON :

|Format|Crate Rust|Taille|Vitesse|Compatibilité serde|Recommandation|
|---|---|---|---|---|---|
|JSON|`serde_json` v1.0.149|La plus grande|~5µs/struct|🟢 Native|IPC uniquement|
|MessagePack|`rmp-serde` v1.3.0|**La plus petite** (~24 octets)|~100ns|🟢 Native|**🥇 Stockage**|
|bincode|`bincode` v1.x/v2.x|Très compacte (~58 octets)|**~35ns** (le plus rapide)|🟢 Native|🥈 Alternative rapide|
|CBOR|`ciborium` v0.2.2|Moyenne (~72 octets)|~500µs désérialisation|🟢 Native|❌ Performances décevantes|
|Protocol Buffers|`prost` v0.13.x|Compacte|~779ns|🟡 Via pbjson|❌ Complexité inutile|

Le pattern recommandé est **sérialiser → chiffrer → stocker** : `rmp_serde::to_vec(&record)` → AES-256-GCM → BLOB SQLite. Pour la plupart des cas, le chiffrement full-DB par SQLCipher rend le chiffrement par champ superflu — ne l'ajouter que si des utilisateurs différents doivent avoir des clés différentes (crypto-shredding pour le RGPD).

---

## Partie 5 — Architecture de sécurité end-to-end et conformité RGPD

### Conformité RGPD : ce que la loi exige réellement

L'article 32 du RGPD **recommande fortement** le chiffrement mais utilise la formule « selon les cas » avec une approche par les risques. Pour des données financières ou médicales (article 9, catégories spéciales), le chiffrement at-rest est **de facto obligatoire**. La CNIL recommande explicitement **AES en mode GCM/CCM/EAX, ou ChaCha20-Poly1305**, et interdit DES, 3DES, MD5 et SHA-1.

Le **droit à l'effacement** (article 17) s'implémente efficacement via le **crypto-shredding** : attribuer une clé de chiffrement unique (DEK) par sujet de données, puis détruire cette clé pour rendre les données irrécupérables — y compris dans les sauvegardes. Avec SQLCipher en chiffrement full-DB, combiner le `DELETE` SQL classique avec une stratégie de clés par utilisateur pour les champs les plus sensibles.

Pour la **journalisation des accès**, le RGPD n'impose pas de format spécifique mais attend une traçabilité démontrable (principe de responsabilité, article 5(2)). Logger : qui, quand, quelle action, quelles catégories de données accédées. Utiliser `tracing` avec des champs structurés et s'assurer que les champs sensibles sont encapsulés dans `SecretString` pour éviter leur apparition dans les logs.

### Surface d'attaque spécifique à Tauri V2

Le modèle de sécurité Tauri traite le **WebView comme non fiable**. Le système de capabilities restreint les commandes accessibles par fenêtre/webview, le CSP empêche le chargement de ressources externes, et le Isolation Pattern chiffre l'IPC. Les vecteurs critiques :

- **XSS dans le frontend** : un script injecté peut appeler `invoke()` sur les commandes autorisées par les capabilities de cette fenêtre. Le Isolation Pattern et un CSP strict (`default-src 'self'`) sont les mitigations principales.
- **Supply chain npm** : une dépendance malveillante accède au même contexte que le code légitime. CSP et Isolation Pattern limitent l'impact.
- **WebView non bundlé** : Tauri utilise le WebView de l'OS (WebView2 sur Windows, WebKitGTK sur Linux, WKWebView sur macOS). Un 0-day WebView est un risque résiduel — dépend de la mise à jour de l'OS par l'utilisateur.

Configuration des capabilities minimales :

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-window",
  "windows": ["main"],
  "permissions": [
    "core:path:default",
    "core:event:default",
    "core:window:default",
    "allow-open-database",
    "allow-query-patients",
    "deny-raw-sql-execute"
  ]
}
```

### Tests de sécurité en CI/CD

```yaml
# .github/workflows/security.yml
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Audit des dépendances
        run: cargo install cargo-audit && cargo audit
      - name: Vérification licences et bans
        run: cargo install cargo-deny && cargo deny check
      - name: Comptage de code unsafe
        run: cargo install cargo-geiger && cargo geiger
```

Les crates `cargo-audit` (base RustSec) et `cargo-deny` (licences, advisories, bans) sont les deux indispensables. `cargo-geiger` quantifie l'utilisation de `unsafe` dans l'arbre de dépendances. Pour le fuzzing des handlers IPC, `cargo-fuzz` cible les fonctions de désérialisation et de validation d'entrées.

---

## Architecture de référence : flux de sécurité complet

```
┌──────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                            │
│                    Saisit mot de passe                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────▼───────────────┐
         │     FRONTEND (SvelteKit)      │
         │  CSP strict · freezePrototype │
         │  Pas de données sensibles     │
         └───────────────┬───────────────┘
                         │ IPC (JSON + AES-GCM via Isolation Pattern)
         ┌───────────────▼───────────────┐
         │      RUST BACKEND (Tauri)     │
         │  Capabilities / Permissions   │
         ├───────────────────────────────┤
         │ 1. Argon2id(pwd, salt)        │──→ derived_key (Zeroizing<[u8;32]>)
         │ 2. Ouvre SQLCipher avec clé   │──→ Connection chiffrée AES-256
         │ 3. Stocke KEK dans keychain   │──→ keyring::Entry (OS natif)
         │ 4. Gère sessions/tokens       │──→ tauri::State (mémoire seule)
         │ 5. Sérialise: rmp-serde       │──→ MessagePack compact
         │ 6. Zeroize clés au logout     │──→ zeroize + secrecy
         └───────────────┬───────────────┘
                         │
         ┌───────────────▼───────────────┐
         │       STOCKAGE LOCAL          │
         │  SQLCipher (AES-256-CBC)      │  ← base chiffrée entièrement
         │  Keychain OS (DPAPI/Keychain/ │  ← KEK pour "Se souvenir"
         │    Secret Service)            │
         │  Fichier .salt (sel Argon2id) │  ← non secret, unique par base
         │  Fichier .wrapped_key         │  ← clé chiffrée par KEK
         └───────────────────────────────┘
```

---

## Checklist d'implémentation ordonnée

Implémenter dans cet ordre pour construire chaque couche sur les fondations précédentes :

1. **Chiffrement SQLite** — Intégrer rusqlite + bundled-sqlcipher-vendored-openssl. Valider la compilation cross-platform dans le CI. Créer les commandes Tauri `open_database`, `close_database` avec une clé en dur temporaire pour les tests.
    
2. **Hashing et dérivation de clé** — Intégrer le crate argon2. Implémenter `derive_db_key()` avec Argon2id. Remplacer la clé en dur par une clé dérivée du mot de passe. Générer et persister le sel.
    
3. **Keychain OS et "Se souvenir"** — Intégrer le crate keyring. Implémenter le schéma de key wrapping (KEK aléatoire dans keychain + clé wrappée sur disque). Ajouter la logique de fallback si le keychain n'est pas disponible.
    
4. **Sérialisation sécurisée et IPC** — Activer le Isolation Pattern. Configurer le CSP strict. Encapsuler les types sensibles avec secrecy/zeroize. Configurer les capabilities minimales par fenêtre.
    
5. **Authentification avancée** — Ajouter OAuth2/OIDC si nécessaire via tauri-plugin-oauth. Intégrer la biométrie via tauri-plugin-biometry avec fallback mot de passe. Implémenter le refresh token flow.
    
6. **Conformité et audit** — Implémenter la journalisation des accès via tracing. Ajouter le crypto-shredding pour le droit à l'effacement. Configurer cargo-audit et cargo-deny dans le CI. Documenter les mesures RGPD article 32.
    

---

## Matrice des risques résiduels

|Risque|Probabilité|Impact|Niveau résiduel|Mitigation appliquée|
|---|---|---|---|---|
|Vulnérabilité 0-day du WebView OS|Moyenne|Élevé|**ÉLEVÉ**|Pas de contrôle direct — dépend des mises à jour OS|
|Accès physique à la machine|Moyenne|Critique|**ÉLEVÉ**|Chiffrement at-rest SQLCipher + keychain OS ; recommander le chiffrement disque (BitLocker/FileVault)|
|Supply chain npm malveillante|Moyenne|Élevé|**MOYEN**|CSP + Isolation Pattern + audit des dépendances|
|Extraction mémoire (cold boot, dump)|Faible|Élevé|**MOYEN**|zeroize/secrecy ; données sensibles minimisées côté WebView|
|Mot de passe utilisateur faible|Moyenne|Critique|**MOYEN**|Argon2id (memory-hard) ralentit le brute-force ; imposer une complexité minimale|
|Perte du mot de passe (données irrémédiablement perdues)|Faible|Critique|**MOYEN**|Aucune récupération possible par design ; documenter clairement ce risque pour l'utilisateur|
|XSS dans le frontend|Faible|Moyen|**FAIBLE**|CSP + freezePrototype + Isolation Pattern|
|Injection de commande IPC|Faible|Élevé|**FAIBLE**|Validation des entrées en Rust + capabilities + scopes|
|Mise à jour malveillante|Faible|Critique|**FAIBLE**|Signature obligatoire vérifiée par tauri-plugin-updater|

**Risque résiduel le plus critique :** La combinaison accès physique + WebView non à jour constitue le vecteur d'attaque le plus difficile à mitiger côté applicatif. Recommander systématiquement le chiffrement du disque au niveau OS et documenter l'importance des mises à jour système dans les conditions d'utilisation.

---

## Synthèse des dépendances Cargo.toml

```toml
[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# Chiffrement SQLite
rusqlite = { version = "0.38.0", features = ["bundled-sqlcipher-vendored-openssl"] }

# Hashing et cryptographie
argon2 = "0.5.3"
aes-gcm = "0.10"
rand = "0.8"

# Gestion des secrets
keyring = { version = "3.6.3", features = [
    "apple-native", "windows-native", "linux-native-sync-persistent"
] }

# Protection mémoire
zeroize = { version = "1.8.2", features = ["derive"] }
secrecy = { version = "0.10", features = ["serde"] }

# Sérialisation compacte (stockage)
rmp-serde = "1.3.0"

# OAuth2 (si nécessaire)
oauth2 = "5.0.0"
tauri-plugin-oauth = "2.0.0"

# Journalisation sécurisée
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter"] }
```

## Conclusion

L'architecture proposée atteint un équilibre entre robustesse cryptographique et faisabilité d'implémentation pour un développeur intermédiaire. Le choix de **SQLCipher via rusqlite** plutôt que des solutions plus exotiques, du **crate keyring** plutôt que Stronghold (en voie de dépréciation), et du **Isolation Pattern natif Tauri** plutôt qu'un chiffrement IPC custom, privilégie systématiquement les solutions les plus maintenues et documentées de l'écosystème. Le risque résiduel principal reste la dépendance au WebView de l'OS et à l'hygiène de sécurité de la machine de l'utilisateur final — domaines hors de portée de l'application, mais qu'une documentation utilisateur claire doit adresser. L'ensemble est conforme aux exigences RGPD article 32 et aux recommandations cryptographiques de la CNIL pour un traitement de données de santé ou financières.