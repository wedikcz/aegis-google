# Aegis Mobile — Command Center
> **Defenzivní mobilní bezpečnostní platforma (SOC v kapse) pro Android 15 (API 35)**  
> Optimalizováno pro **Infinix Hot 50 Pro Plus (model X6880)** s procesorem aarch64 (arm64-v8a) a 6,78" AMOLED 120Hz displejem.

---

## 🛡️ Přehled architektury

Aegis Mobile je defenzivní bezpečnostní platforma inspirovaná webovou aplikací Aegis, přizpůsobená pro mobilní bezpečnostní analytiky, incident respondery a certifikované etické hackery (CEH). Veškerá data jsou zpracovávána **offline-first** bez jakékoliv telemetrie, sledovacích knihoven či reklamních SDK.

### Cílové zařízení & HW Profil
- **Zařízení:** Infinix Hot 50 Pro Plus (model X6880)
- **CPU architektura:** `aarch64` (`arm64-v8a`)
- **OS:** Android 15 (Vanilla Ice Cream, API Level 35, targetSdk 35, minSdk 31)
- **Displej:** 6,78" AMOLED, 120 Hz, 1080×2436 px, taktický HUD režim s fonty Archivo a IBM Plex Mono
- **Bezpečnostní politiky OS:** SELinux Enforcing, Android 15 edge-to-edge, omezení implicitních intentů a Restricted Settings pro usnadnění přístupu (Accessibility).

---

## 🧩 Implementované moduly (1:1)

1. **ATT&CK Katalog Mobile**  
   Offline databáze technik MITRE ATT&CK® for Mobile s filtry podle taktik, platforem (Android/iOS), vyhledáváním a štítky mitigací (MIT), detekcí (DET) a post-exploitace (POST). Možnost 1 kliknutím vytvořit playbook nebo založit incident.

2. **Cases (Incident Response)**  
   Správa bezpečnostních incidentů s 6fázovou statusovou linkou:  
   `New → Triage → Containment → Eradication → Recovery → Closed`.  
   Prioritizace závažnosti (Critical, High, Medium, Low), časová osa kroků (Timeline) a export do Markdown reportu.

3. **Playbooks**  
   Standardizované operační postupy odvozené z mitigací MITRE ATT&CK. Interaktivní odškrtávací kontrolní seznamy pro sanaci zneužití Accessibility, sideloadingu či mobilního ransomware.

4. **Coverage (Validace pokrytí testy)**  
   Matice ověřování detekčního pokrytí (PASS / FAIL / RESET / UNTESTED). Ukazatel celkové míry pokrytí v procentech s možností automatického generování (seedování) chybějících testů.

5. **Threat Intel**  
   Lokální databáze IOC (hashe SHA-256, C2 IP adresy, domény, škodlivé package names). Obsahuje interaktivní simulátor příjmu dat přes Webhook (MISP / OpenCTI).

6. **File Scanner (Statická forenzní analýza SAF)**  
   - Uživatel vybere soubor, APK nebo log ze systémového úložiště skrze Storage Access Framework (SAF).
   - **Shannonova entropie:** Reálný výpočet $H = -\sum p_i \log_2(p_i)$ a graf rozložení entropie po segmentech souboru (práh $\ge 7.20$ detekuje šifrovaný kód / packer).
   - **IOC extrakce:** Výpočet SHA-256/MD5, filtrace veřejných IP, FQDN domén, URL a balíčků Android.
   - **Heuristiky:** Detekce keylogger vzorů (`TYPE_VIEW_TEXT_CHANGED`), zneužití Accessibility (`BIND_ACCESSIBILITY_SERVICE`), Device Admin / Ransomware řetězců, exfiltrace na Telegram a dynamického načítání (`DexClassLoader`).
   - Verdikt: `ČISTÝ` / `PODEZŘELÝ` / `ŠKODLIVÝ` s rizikovým skóre 0–100 a mapováním na ATT&CK.

7. **AI Copilot (MoE Asistent)**  
   Architektura Mixture-of-Experts se 4 specializovanými agenty:
   - *Threat Analyst:* rozbor hrozeb, IOC a malware vzorů
   - *IR Coach:* velení při incidentu, containment a bezpečný restart do Safe Mode
   - *Code Auditor:* revize AndroidManifest.xml, oprávnění a OWASP MASVS v2
   - *ATT&CK Navigator:* mapování technik na matici
   Podpora vlastního API klíče (OpenAI / OpenRouter / DeepSeek / Qwen) uloženého v lokálním úložišti, nebo integrovaný offline expertní model.

8. **Learning Lab (Etický tutor)**  
   - Teoretické lekce útočných vektorů pro legální cvičná prostředí (HTB/THM) v souladu s etickým kodexem CEH.
   - Interaktivní checklist OWASP Mobile Application Security Verification Standard (MASVS v2).
   - **Secret Scanner:** Analyzátor zdrojového kódu a manifestů pro detekci nechtěně vložených API klíčů, hesel a nebezpečných práv.

9. **Android Native Studio Project Exporter**  
   Přímo v aplikaci je k dispozici prohlížeč a exportér kompletních zdrojových souborů pro Android Studio (Kotlin, Jetpack Compose, Room SQLite, Hilt, Gradle kts a JUnit testy).

---

## 🛠️ Postup sestavení release APK (Infinix Hot 50 Pro Plus)

Jelikož webové cloudové prostředí neobsahuje JDK ani Android SDK (`javac`, `aapt2`), zkompilování nativního `.apk` balíčku probíhá v Android Studiu nebo lokálním terminálu pomocí přiložených zdrojových souborů.

### 1. Vygenerování podpisového klíče:
```bash
keytool -genkey -v -keystore aegis-release-key.jks \
  -alias aegis-mobile -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Aegis Mobile SOC, OU=Defensive Security, O=Aegis, C=CZ"
```

### 2. Sestavení zipalignovaného release APK:
```bash
export AEGIS_KEYSTORE_PASSWORD="AegisSecurity2026!"
export AEGIS_KEY_PASSWORD="AegisSecurity2026!"

./gradlew assembleRelease
```
Výsledné podepsané APK pro ABI `arm64-v8a` naleznete v:
`app/build/outputs/apk/release/aegis-mobile-release.apk`

### 3. Instalace na Infinix Hot 50 Pro Plus (X6880):
1. Přeneste APK na zařízení (přes USB kabel, Bluetooth nebo `adb install -r aegis-mobile-release.apk`).
2. V nastavení telefonu povolte volbu **„Instalovat neznámé aplikace"** pro váš Správce souborů.
3. Hlášení Google Play Protect o neznámém vývojáři je u self-signed bezpečnostního nástroje očekávané – klikněte na **„Více informací"** a **„Přesto nainstalovat"**.

---

## 🔒 Bezpečnostní a etická omezení
- Aplikace neobsahuje žádné exploity, C2 servery, malware generátory ani obfuskované útočné nástroje.
- Nástroj neprovádí plošný sken celého systému ani sběr dat z jiných aplikací; analyzuje výhradně data, která mu uživatel sám předloží prostřednictvím systémového dialogu SAF.
